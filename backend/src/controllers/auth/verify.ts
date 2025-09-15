import { sendWelcomeEmail } from "../../email/sendmail";
import prisma from "../../utils/prisma";
import express from "express";

const verifyUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        message: "User ID and verification code are required",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.verificationToken !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }
    if (!user.verificationExp || user.verificationExp < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }
    user.isVerified = true;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify user",
      });
    }

    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during verification",
    });
  }
};

export default verifyUser;
