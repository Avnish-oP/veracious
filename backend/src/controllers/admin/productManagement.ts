import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const pageNum = Number(page) || 1;
    const take = Number(limit);
    const skip = (pageNum - 1) * take;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { brand: { contains: String(search), mode: "insensitive" } },
        { sku: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        where,
        include: {
            images: {
                where: { isMain: true },
                select: { url: true }
            }
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    // Format for frontend
    const productList = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined, 
    }));

    res.status(200).json({
      success: true,
      products: productList,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Get Admin Products Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  // ... existing code ...
  try {
    const {
      name,
      slug,
      description,
      brand,
      price,
      discountPrice,
      stock,
      sku,
      frameShape,
      frameMaterial,
      frameColor,
      lensType,
      lensColor,
      gender,
      tags,
      specifications,
      images, 
      categoryIds, // Array of category IDs
      isFeatured,
    } = req.body;

    // TODO: Implement Image Transformation

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        brand,
        price,
        discountPrice,
        stock: parseInt(stock),
        sku,
        frameShape,
        frameMaterial,
        frameColor,
        lensType,
        lensColor,
        gender,
        tags,
        isFeatured: isFeatured || false,
        specifications: specifications || {},
        images: {
            create: images.map((img: any) => ({
                url: img.url,
                isMain: img.isMain || false,
                altText: img.altText || name
            }))
        },
        categories: {
            connect: categoryIds ? categoryIds.map((id: string) => ({ id })) : []
        }
      },
      include: {
        images: true,
        categories: true
      }
    });

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    if (error.code === 'P2002') {
        return res.status(400).json({
            success: false,
            message: "Product with this SKU or Slug already exists"
        });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await prisma.product.delete({
            where: { id },
        });
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: deletedProduct
        });
    } catch (error: any) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            slug,
            description,
            brand,
            price,
            discountPrice,
            stock,
            sku,
            frameShape,
            frameMaterial,
            frameColor,
            lensType,
            lensColor,
            gender,
            tags,
            specifications,
            images,
            categoryIds,
            isFeatured 
        } = req.body;

        // Transaction to handle update + image replacement
        const updatedProduct = await prisma.$transaction(async (prisma) => {
            // 1. Update basic fields
             await prisma.product.update({
                where: { id },
                data: {
                    name,
                    slug,
                    description,
                    brand,
                    price,
                    discountPrice,
                    stock: parseInt(stock),
                    sku,
                    frameShape,
                    frameMaterial,
                    frameColor,
                    lensType,
                    lensColor,
                    gender,
                    tags,
                    isFeatured: isFeatured,
                    specifications: specifications || {},
                    categories: categoryIds ? {
                        set: [], // Clear existing
                        connect: categoryIds.map((cid: string) => ({ id: cid })) // Connect new
                    } : undefined
                }
            });

            // 2. Handle Images (Delete all and re-create for simplicity for now)
            // A more optimized approach would be to diff, but this ensures full sync with frontend state.
            if (images && Array.isArray(images)) {
                 await prisma.productImage.deleteMany({
                    where: { productId: id }
                });
                
                await prisma.productImage.createMany({
                    data: images.map((img: any) => ({
                        productId: id,
                        url: img.url,
                        isMain: img.isMain || false,
                        altText: img.altText || name
                    }))
                });
            }

            // 3. Return updated product with images
            return prisma.product.findUnique({
                where: { id },
                include: { images: true, categories: true }
            });
        }, {
            timeout: 20000
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error: any) {
        console.error("Update Product Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
};
