import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all lens prices
export const getLensPrices = async (req: Request, res: Response) => {
  try {
    const lensPrices = await prisma.lensPrice.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, lensPrices });
  } catch (error) {
    console.error("Error fetching lens prices:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lens prices" });
  }
};

// Create a new lens price
export const createLensPrice = async (req: Request, res: Response) => {
  try {
    const { name, type, price, description, isActive } = req.body;

    if (!name || !type || price === undefined) {
      res.status(400).json({ success: false, message: "Name, type, and price are required" });
      return;
    }

    const lensPrice = await prisma.lensPrice.create({
      data: {
        name,
        type,
        price: Number(price),
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({ success: true, lensPrice });
  } catch (error) {
    console.error("Error creating lens price:", error);
    res.status(500).json({ success: false, message: "Failed to create lens price" });
  }
};

// Update a lens price
export const updateLensPrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, price, description, isActive } = req.body;

    const lensPrice = await prisma.lensPrice.update({
      where: { id },
      data: {
        name,
        type,
        price: price !== undefined ? Number(price) : undefined,
        description,
        isActive,
      },
    });

    res.status(200).json({ success: true, lensPrice });
  } catch (error) {
    console.error("Error updating lens price:", error);
    res.status(500).json({ success: false, message: "Failed to update lens price" });
  }
};

// Delete a lens price
export const deleteLensPrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.lensPrice.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: "Lens price deleted successfully" });
  } catch (error) {
    console.error("Error deleting lens price:", error);
    res.status(500).json({ success: false, message: "Failed to delete lens price" });
  }
};
