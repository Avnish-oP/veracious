import express from "express";
import prisma from "../../utils/prisma";

const getCurrentUser = async (req: express.Request, res: express.Response) => {
  try {
    // User is already authenticated and attached by authMiddleware
    // authMiddleware handles token refresh automatically
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Fetch fresh user data (authMiddleware only attaches basic user)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isVerified: true,
        faceShape: true,
        preferredStyles: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

export default getCurrentUser;
