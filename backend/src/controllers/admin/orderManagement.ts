import { Request, Response } from "express";
import prisma from "../../utils/prisma";

// Get all orders with pagination and filters
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Only show paid orders by default, unless specifically filtering
    if (status) {
      where.status = status;
    }

    // Search by order ID
    if (search) {
      where.id = { contains: search, mode: "insensitive" };
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get orders with user info
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          totalAmount: true,
          discount: true,
          finalAmount: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      orders: orders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        discount: Number(o.discount),
        finalAmount: Number(o.finalAmount),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Get single order details
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        totalAmount: true,
        discount: true,
        finalAmount: true,
        currency: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        items: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
        address: {
          select: {
            id: true,
            line1: true,
            line2: true,
            city: true,
            state: true,
            postal: true,
            country: true,
          },
        },
        coupon: {
          select: {
            code: true,
            discountType: true,
            discount: true,
          },
        },
        payments: {
          select: {
            id: true,
            paymentId: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Get product details for each item
    const items = order.items as any[];
    let itemsWithProducts: any[] = [];

    if (Array.isArray(items)) {
      const productIds = items.map((item) => item.productId).filter(Boolean);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          images: { take: 1, select: { url: true } },
        },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      itemsWithProducts = items.map((item) => {
        const product = productMap.get(item.productId);
        return {
          ...item,
          productName: product?.name || "Unknown Product",
          productImage: product?.images[0]?.url || null,
        };
      });
    }

    return res.json({
      success: true,
      order: {
        ...order,
        totalAmount: Number(order.totalAmount),
        discount: Number(order.discount),
        finalAmount: Number(order.finalAmount),
        items: itemsWithProducts,
        coupon: order.coupon
          ? {
              ...order.coupon,
              discount: Number(order.coupon.discount),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get order details error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["PENDING", "PAYMENT_FAILED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};
