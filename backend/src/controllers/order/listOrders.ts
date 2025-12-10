import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const listOrders = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error("Error listing orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching orders",
    });
  }
};
