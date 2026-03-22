import { sendResetSuccessEmail } from "../../email/sendmail";
import prisma from "../../utils/prisma";
import express from "express";
import bcrypt from "bcryptjs";

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

  // Password strength validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters with uppercase, lowercase, and a number",
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
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
