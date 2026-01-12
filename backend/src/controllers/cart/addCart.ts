import prisma from "../../utils/prisma";
import redisClient from "../../lib/redis";
import express from "express";

export const addToCart = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const { productId, quantity, configuration } = req.body;
  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }
  try {
    const key = `cart:${userId}`;
    const cartData = await redisClient.get(key);
    // Ensure cart is an object with items array. previous code returned a JSON string which caused
    // `cart.items` to be undefined and throw when calling findIndex.
    let cart = cartData ? JSON.parse(cartData) : { items: [] };

    const existingItemIndex = cart.items.findIndex(
      (item: any) => 
        item.productId === productId && 
        JSON.stringify(item.configuration) === JSON.stringify(configuration)
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true },
      });
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      cart.items.push({ productId, quantity, configuration });
    }
    
    // Enrich configuration with current lens price if ID exists
    // This ensures that even if frontend sends an old price or no price, we source of truth it here.
    // However, if we do this, we should modify the item inside the cart array we just touched.
    const latestItemIndex = existingItemIndex !== -1 ? existingItemIndex : cart.items.length - 1;
    const item = cart.items[latestItemIndex];

    if (item.configuration && item.configuration.lensPriceId) {
        const lensPrice = await prisma.lensPrice.findUnique({
            where: { id: item.configuration.lensPriceId }
        });
        if (lensPrice) {
            item.configuration = {
                ...item.configuration,
                lensPrice: Number(lensPrice.price),
                // Ensure other details are consistent or just trust frontend for non-price fields?
                // Ideally we'd overwrite name/type too but let's stick to price for now. 
            };
        }
    }
    cart.items[latestItemIndex] = item;

    console.log(cart);
    await redisClient.set(key, JSON.stringify(cart));
    //now db

    let dbCart = await prisma.cart.upsert({
      where: { userId },
      create: {
        userId,
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            configuration: item.configuration
          })),
        },
      },
      update: {
        items: {
          deleteMany: {}, // Remove all existing items
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            configuration: item.configuration
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                discountPrice: true,
                images: {
                  where: { isMain: true },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedCart = {
      id: dbCart.id,
      userId: dbCart.userId,
      items: dbCart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        configuration: item.configuration,
        product: {
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          images: item.product.images.map((img: any) => img.url),
        },
      })),
      updatedAt: dbCart.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("addToCart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "adding cart controller error" });
  }
};

export const getCart = async (req: express.Request, res: express.Response) => {
  const userId = req.user.id;
  const key = `cart:${userId}`;
  try {
    const cartData = await redisClient.get(key);
    if (!cartData) {
      //get from db with product details
      let dbCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  price: true,
                  discountPrice: true,
                  images: {
                    where: { isMain: true },
                    select: { url: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!dbCart) {
        return res.status(200).json({ success: true, cart: { items: [] } });
      }

      // Format the response and refresh lens prices
      const formattedCartItems = await Promise.all(dbCart.items.map(async (item: any) => {
          let config = item.configuration;
          if (config && typeof config === 'object' && config.lensPriceId) {
             const lensPrice = await prisma.lensPrice.findUnique({
                 where: { id: config.lensPriceId }
             });
             if (lensPrice) {
                 config = { ...config, lensPrice: Number(lensPrice.price) };
             }
          }
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            configuration: config,
            product: {
                id: item.product.id,
                name: item.product.name,
                brand: item.product.brand,
                price: item.product.price,
                discountPrice: item.product.discountPrice,
                images: item.product.images.map((img: any) => img.url),
            },
          };
      }));

      const formattedCart = {
        id: dbCart.id,
        userId: dbCart.userId,
        items: formattedCartItems,
        updatedAt: dbCart.updatedAt,
      };

      await redisClient.set(
        key,
        JSON.stringify({
          items: dbCart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        })
      );
      return res.status(200).json({ success: true, cart: formattedCart });
    }

    // If cart is in Redis, fetch product details for each item
    const cart = JSON.parse(cartData);
    const productIds = cart.items.map((item: any) => item.productId);

    // Fetch all product details
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        discountPrice: true,
        images: {
          where: { isMain: true },
          select: { url: true },
        },
      },
    });

    // Create a map of product details
    const productMap: any = {};
    products.forEach((product: any) => {
      productMap[product.id] = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        discountPrice: product.discountPrice,
        images: product.images.map((img: any) => img.url),
      };
    });

    // Attach product details to cart items AND refresh lens prices if needed
    // Note: We should ideally update DB/Redis if price changed, but for now just returning fresh price is enough for display
    const enrichedItems = await Promise.all(cart.items.map(async (item: any) => {
        let config = item.configuration;
        if (config && config.lensPriceId) {
            const lensPrice = await prisma.lensPrice.findUnique({
                 where: { id: config.lensPriceId }
            });
            if (lensPrice) {
                 config = { ...config, lensPrice: Number(lensPrice.price) };
            }
        }
        return {
            productId: item.productId,
            quantity: item.quantity,
            configuration: config,
            product: productMap[item.productId] || null,
        };
    }));

    const enrichedCart = {
      items: enrichedItems
    };

    return res.status(200).json({ success: true, cart: enrichedCart });
  } catch (error) {
    console.error("error fetching cart", error);
    return res
      .status(500)
      .json({ success: false, message: "error fetching cart" });
  }
};

export const updateCartItem = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.user.id;

  const { productId, quantity } = req.body;
  if (!productId || quantity == null || quantity < 0) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }
  try {
    const key = `cart:${userId}`;
    const cartData = await redisClient.get(key);
    let cart = cartData ? JSON.parse(cartData) : { items: [] };
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId === productId
    );
    if (existingItemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }
    cart.items[existingItemIndex].quantity = quantity;
    await redisClient.set(key, JSON.stringify(cart));
    // Update DB
    // Find the cart item id by productId
    const dbCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                discountPrice: true,
                images: {
                  where: { isMain: true },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });
    const cartItem = dbCart?.items.find(
      (item: any) => item.productId === productId
    );
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in DB" });
    }
    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: {
        items: {
          update: {
            where: { id: cartItem.id },
            data: { quantity },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                discountPrice: true,
                images: {
                  where: { isMain: true },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedCart = {
      id: updatedCart.id,
      userId: updatedCart.userId,
      items: updatedCart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        configuration: item.configuration,
        product: {
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          images: item.product.images.map((img: any) => img.url),
        },
      })),
      updatedAt: updatedCart.updatedAt,
    };

    return res
      .status(200)
      .json({ success: true, message: "Cart updated", cart: formattedCart });
  } catch (error) {
    console.error("error updating cart", error);
    return res
      .status(500)
      .json({ success: false, message: "error updating cart" });
  }
};

export const removeCartItem = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.user.id;
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }
  try {
    const key = `cart:${userId}`;
    const cartData = await redisClient.get(key);
    let cart = cartData ? JSON.parse(cartData) : { items: [] };
    cart.items = cart.items.filter((item: any) => item.productId !== productId);
    await redisClient.set(key, JSON.stringify(cart));
    // Update DB
    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: {
        items: {
          deleteMany: { productId },
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                discountPrice: true,
                images: {
                  where: { isMain: true },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedCart = {
      id: updatedCart.id,
      userId: updatedCart.userId,
      items: updatedCart.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        configuration: item.configuration,
        product: {
          id: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          discountPrice: item.product.discountPrice,
          images: item.product.images.map((img: any) => img.url),
        },
      })),
      updatedAt: updatedCart.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("error removing cart item", error);
    return res
      .status(500)
      .json({ success: false, message: "error removing cart item" });
  }
};

export const mergeCarts = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.user.id;

  const { guestCart } = req.body; // Expecting { items: [ { productId, quantity }, ... ] }
  if (!guestCart || !Array.isArray(guestCart.items)) {
    return res.status(400).json({ success: false, message: "Invalid input" });
  }
  try {
    const key = `cart:${userId}`;
    const cartData = await redisClient.get(key);
    console.log("merging carts", { cartData, guestCart });
    let cart = cartData ? JSON.parse(cartData) : { items: [] };
    console.log("existing cart", cart);
    // Merge guest cart into user cart
    guestCart.items.forEach((guestItem: any) => {
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId === guestItem.productId
      );
      if (existingItemIndex !== -1) {
        // If item exists, update quantity
        cart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // If item doesn't exist, add to cart
        cart.items.push(guestItem);
      }
    });
    await redisClient.set(key, JSON.stringify(cart));
    return res
      .status(200)
      .json({ success: true, message: "Carts merged", cart });
  } catch (error) {
    console.error("error merging carts", error);
    return res
      .status(500)
      .json({ success: false, message: "error merging carts" });
  }
};

export const productDetails = async (
  req: express.Request,
  res: express.Response
) => {
  const { productId } = req.params;
  // Fetch product details from the database
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        brand: true,
        price: true,
        discountPrice: true,
        description: true,
        images: {
          where: { isMain: true },
          select: { url: true },
        },
      },
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("error fetching product details", error);
    return res
      .status(500)
      .json({ success: false, message: "error fetching product details" });
  }
};
