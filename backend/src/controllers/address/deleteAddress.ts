import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await prisma.address.delete({
      where: { id },
    });

    return res.json({ message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
