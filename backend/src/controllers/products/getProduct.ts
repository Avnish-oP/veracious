import prisma from "../../utils/prisma";
import { Request, Response } from "express";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit = 10, search, category } = req.query;
    const pageNum = Number(page) || 1;
    const take = Number(limit);
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" as const } },
        { brand: { contains: String(search), mode: "insensitive" as const } },
      ];
    }

    if (category) {
      where.categories = {
        some: { id: String(category) },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          discountPrice: true,
          frameShape: true,
          frameMaterial: true,
          frameColor: true,
          lensType: true,
          lensColor: true,
          gender: true,
          isFeatured: true,
          images: {
            where: { isMain: true },
            select: { url: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    // Flatten image field for frontend
    const productCards = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined, // remove images array
    }));

    res.status(200).json({ products: productCards, total });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  // Logic to get a product by ID
  const { productId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        applicableCoupons: {
          where: { isActive: true },
          select: {
            id: true,
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
            minOrderValue: true,
            validFrom: true,
            validTo: true,
            usageLimit: true,
            perUserLimit: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            body: true,
            createdAt: true,
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        categories: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch product" });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const take = Number(limit);

    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        price: true,
        discountPrice: true,
        frameShape: true,
        frameMaterial: true,
        frameColor: true,
        lensType: true,
        lensColor: true,
        gender: true,
        isFeatured: true,
        images: {
          where: { isMain: true },
          select: { url: true },
        },
      },
    });

    const productCards = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined,
    }));

    res.status(200).json({ success: true, products: productCards });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch featured products" });
  }
};

export const getProductsByCategory = (req: Request, res: Response) => {
  const { categoryId } = req.params;

  prisma.product
    .findMany({
      where: { categories: { some: { id: categoryId } } },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        price: true,
        discountPrice: true,
        frameShape: true,
        frameMaterial: true,
        frameColor: true,
        lensType: true,
        lensColor: true,
        gender: true,
        isFeatured: true,
        images: {
          where: { isMain: true },
          select: { url: true },
        },
      },
    })
    .then((products) => {
      const productCards = products.map((product) => ({
        ...product,
        image: product.images[0]?.url || null,
        images: undefined,
      }));
      res.status(200).json({ success: true, products: productCards });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        error: "Failed to fetch products by category",
      });
    });
};

export const getTrendingProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const take = Number(limit);
    console.log("got request here");
    // For simplicity, trending products are those with the most reviews but later it will be most purchased one
    const products = await prisma.product.findMany({
      take,
      orderBy: { reviews: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        price: true,
        discountPrice: true,
        frameShape: true,
        frameMaterial: true,
        frameColor: true,
        lensType: true,
        lensColor: true,
        gender: true,
        isFeatured: true,
        images: {
          where: { isMain: true },
          select: { url: true },
        },
      },
    });
    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No trending products found" });
    }

    const productCards = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined,
    }));

    return res.status(200).json({ success: true, products: productCards });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch trending products" });
  }
};
