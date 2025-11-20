import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }, { name: "asc" }],
      include: { children: true },
    } as any);

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch categories" });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      // include children in response if generated client has it; cast to any to be resilient
    } as any);

    if (!category) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch category" });
  }
};
