import { Request, Response } from "express";
import prisma from "../../utils/prisma";

// Get all coupons with pagination and filters
export const getAdminCoupons = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive === "true") {
      where.isActive = true;
    } else if (isActive === "false") {
      where.isActive = false;
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { redeemedCoupons: true },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return res.json({
      success: true,
      coupons: coupons.map((c) => ({
        ...c,
        discount: Number(c.discount),
        discountValue: c.discountValue ? Number(c.discountValue) : null,
        minOrderValue: c.minOrderValue ? Number(c.minOrderValue) : null,
        usageCount: c._count.redeemedCoupons,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get admin coupons error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
};

// Get single coupon details
export const getCouponById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { redeemedCoupons: true, Order: true },
        },
      },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    return res.json({
      success: true,
      coupon: {
        ...coupon,
        discount: Number(coupon.discount),
        discountValue: coupon.discountValue ? Number(coupon.discountValue) : null,
        minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
        usageCount: coupon._count.redeemedCoupons,
        orderCount: coupon._count.Order,
      },
    });
  } catch (error) {
    console.error("Get coupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch coupon" });
  }
};

// Create new coupon
export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      description,
      discountType,
      discount,
      validFrom,
      validTo,
      usageLimit,
      perUserLimit,
      minOrderValue,
      isActive = true,
      isForNewUsers = false,
      isForAllProducts = true,
    } = req.body;

    // Validate required fields
    if (!code || !discountType || discount === undefined || !validFrom) {
      return res.status(400).json({
        success: false,
        message: "Code, discount type, discount amount, and valid from date are required",
      });
    }

    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A coupon with this code already exists",
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discount,
        validFrom: new Date(validFrom),
        validTo: validTo ? new Date(validTo) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit) : null,
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        isActive,
        isForNewUsers,
        isForAllProducts,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: {
        ...coupon,
        discount: Number(coupon.discount),
        minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
      },
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to create coupon" });
  }
};

// Update existing coupon
export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discountType,
      discount,
      validFrom,
      validTo,
      usageLimit,
      perUserLimit,
      minOrderValue,
      isActive,
      isForNewUsers,
      isForAllProducts,
    } = req.body;

    // Check if coupon exists
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Check if code is being changed and new code already exists
    if (code && code.toUpperCase() !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: "A coupon with this code already exists",
        });
      }
    }

    const updateData: any = {};

    if (code !== undefined) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discount !== undefined) updateData.discount = discount;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
    if (perUserLimit !== undefined) updateData.perUserLimit = perUserLimit ? parseInt(perUserLimit) : null;
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue ? parseFloat(minOrderValue) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isForNewUsers !== undefined) updateData.isForNewUsers = isForNewUsers;
    if (isForAllProducts !== undefined) updateData.isForAllProducts = isForAllProducts;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon: {
        ...coupon,
        discount: Number(coupon.discount),
        minOrderValue: coupon.minOrderValue ? Number(coupon.minOrderValue) : null,
      },
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to update coupon" });
  }
};

// Delete coupon
export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const existing = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { Order: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Warn if coupon has been used in orders
    if (existing._count.Order > 0) {
      // Soft delete by deactivating instead
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return res.json({
        success: true,
        message: "Coupon has been deactivated (it was used in orders and cannot be deleted)",
        deactivated: true,
      });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete coupon" });
  }
};
