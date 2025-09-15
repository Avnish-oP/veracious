import { sendResetSuccessEmail } from "../../email/sendmail";
import prisma from "../../utils/prisma";
import express from "express";

const resetPassword = async (req: express.Request, res: express.Response) => {
  const token = req.query.token;

  const { newPassword } = req.body;
  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing token",
    });
  }
  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password is required",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to reset password",
      });
    }

    await sendResetSuccessEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default resetPassword;
