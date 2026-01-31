import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getOrderById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const orderId = req.params.id;

  try {
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId // Ensure user can only view their own orders
      },
      include: {
        address: true,
        coupon: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Parse items JSON and fetch product details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemsData = order.items as any[];
    const itemsWithProducts = await Promise.all(
      (itemsData || []).map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            brand: true,
            images: {
              select: { url: true },
              take: 1
            },
          }
        });
        return {
          ...item,
          product
        };
      })
    );

    // Transform the order to include shippingAddress in the expected format
    const transformedOrder = {
      id: order.id,
      totalAmount: order.totalAmount,
      subtotal: order.totalAmount,
      discount: order.discount,
      finalAmount: order.finalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: itemsWithProducts,
      shippingAddress: order.address ? {
        street: order.address.line1 + (order.address.line2 ? `, ${order.address.line2}` : ''),
        city: order.address.city,
        state: order.address.state,
        zipCode: order.address.postal,
        country: order.address.country,
      } : null,
    };

    return res.status(200).json({
      success: true,
      order: transformedOrder,
    });
  } catch (error: unknown) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching order",
    });
  }
};
