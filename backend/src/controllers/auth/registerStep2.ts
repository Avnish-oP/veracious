import prisma from "../../utils/prisma";
import express from "express";

const registerStep2 = async (req: express.Request, res: express.Response) => {
  const { userId, preferredStyle, faceShape } = req.body;
  if (!userId || !preferredStyle || !faceShape) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { preferredStyles: preferredStyle, faceShape: faceShape },
    });
    return res
      .status(200)
      .json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export default registerStep2;
