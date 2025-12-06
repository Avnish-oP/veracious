import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      line1,
      line2,
      city,
      state,
      postal,
      country,
      label,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    if (!line1 || !city || !state || !postal || !country) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // If isDefault is true, set all other addresses to isDefault: false
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        line1,
        line2,
        city,
        state,
        postal,
        country,
        label: label || "Home",
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        isDefault: isDefault || false,
      },
    });

    return res.status(201).json(address);
  } catch (error: any) {
    console.error("Error adding address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
