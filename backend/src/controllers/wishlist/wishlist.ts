import redisClient from "../../lib/redis";
import prisma from "../../utils/prisma";
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
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const toggleWishlistItem = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const key = `wishlist:${userId}`;
    const redisData = await redisClient.get(key);
    if (redisData) {
      const wishlist = JSON.parse(redisData);
      const itemIndex = wishlist.findIndex(
        (item: any) => item.productId === productId
      );
      if (itemIndex > -1) {
        wishlist.splice(itemIndex, 1);
      } else {
        wishlist.push({ productId });
      }
      await redisClient.set(key, JSON.stringify(wishlist));
      // Update the database: delete when removed, create when added (no composite unique available)
      if (itemIndex > -1) {
        // item was removed -> delete from DB
        await prisma.wishlist.deleteMany({
          where: { userId, productId },
        });
      } else {
        // item was added -> create in DB
        await prisma.wishlist.create({
          data: { userId, productId },
        });
      }
      return res.status(200).json({ message: "Wishlist updated", wishlist });
    } else {
      // No existing wishlist in Redis: create one with the product
      const wishlist = [{ productId }];
      await redisClient.set(key, JSON.stringify(wishlist));
      // Also create in database
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return res.status(200).json({ message: "Wishlist created", wishlist });
    }
  } catch (error) {
    console.error("Error toggling wishlist item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
