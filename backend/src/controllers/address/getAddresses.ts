import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.json(addresses);
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
