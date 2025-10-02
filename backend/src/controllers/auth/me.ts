import express from "express";
import jwt from "jsonwebtoken";
import prisma from "../../utils/prisma";

const getCurrentUser = async (req: express.Request, res: express.Response) => {
  try {
    const accessToken = req.cookies.accessToken;
    console.log("Access Token:", accessToken);

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    const userId = (decoded as any).id;

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
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default getCurrentUser;
