import prisma from "../../utils/prisma";
import { Request, Response } from "express";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const {
      page,
      limit = 10,
      search,
      category,
      gender,
      minPrice,
      maxPrice,
      brand,
      sort,
    } = req.query;

    const pageNum = Number(page) || 1;
    const take = Number(limit);
    const skip = (pageNum - 1) * take;

    const where: any = {};

    // Search
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" as const } },
        { brand: { contains: String(search), mode: "insensitive" as const } },
        { tags: { has: String(search) } },
      ];
    }

    // Categories (comma separated or single)
    if (category) {
      const categoryIds = String(category).split(",");
      if (categoryIds.length > 0) {
        where.categories = {
          some: { id: { in: categoryIds } },
        };
      }
    }

    // Brands (comma separated or single)
    if (brand) {
      const brands = String(brand).split(",");
      if (brands.length > 0) {
        where.brand = { in: brands, mode: "insensitive" as const };
      }
    }

    // Gender
    if (gender) {
      where.gender = String(gender).toUpperCase();
    }

    // Price Range
    if (minPrice || maxPrice) {
      where.OR = [
        {
          discountPrice: {
            gte: minPrice ? Number(minPrice) : undefined,
            lte: maxPrice ? Number(maxPrice) : undefined,
          },
        },
        {
          discountPrice: null,
          price: {
            gte: minPrice ? Number(minPrice) : undefined,
            lte: maxPrice ? Number(maxPrice) : undefined,
          },
        },
      ];
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort) {
      switch (sort) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "popularity":
          orderBy = { reviews: { _count: "desc" } };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }
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
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    // Flatten image field for frontend
    const productCards = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined, // remove images array
    }));

    res.status(200).json({
      success: true,
      products: productCards,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch products" });
  }
};

export const getProductsFilters = async (req: Request, res: Response) => {
  try {
    const [priceRange, brands, categories, genders] = await Promise.all([
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.product.findMany({
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" }
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" }
      }),
      prisma.product.findMany({
        select: { gender: true },
        distinct: ["gender"],
      })
    ]);

    const uniqueBrands = brands
      .map(b => b.brand)
      .filter((b): b is string => b !== null); // Type guard

    const uniqueGenders = genders
      .map(g => g.gender)
      .filter((g) => g !== null);


    res.status(200).json({
      success: true,
      minPrice: priceRange._min.price || 0,
      maxPrice: priceRange._max.price || 10000,
      brands: uniqueBrands,
      categories,
      genders: uniqueGenders
    });

  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ success: false, error: "Failed to fetch filters" });
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
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page) || 1;
    const take = Number(limit);
    const skip = (pageNum - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true },
        skip,
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
      }),
      prisma.product.count({ where: { isFeatured: true } }),
    ]);

    const productCards = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined,
    }));

    res.status(200).json({
      success: true,
      products: productCards,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch featured products" });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNum = Number(page) || 1;
  const take = Number(limit);
  const skip = (pageNum - 1) * take;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        where: { categories: { some: { id: categoryId } } },
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
      }),
      prisma.product.count({
        where: { categories: { some: { id: categoryId } } },
      }),
    ]);

    const productCards = products.map((product) => ({
      ...product,
      image: product.images[0]?.url || null,
      images: undefined,
    }));

    res.status(200).json({
      products: productCards,
      total,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch products by category",
    });
  }
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
