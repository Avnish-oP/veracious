import redisClient from "@/lib/redis";
import prisma from "@/utils/prisma";
import { Request, Response } from "express";

export const getwishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const toggleWishlistItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const key = `wishlist:${userId}`
    const redisData = await redisClient.get(key)
    if (redisData) {
      const wishlist = JSON.parse(redisData)
    
  } catch (error) {
    
  }
};

