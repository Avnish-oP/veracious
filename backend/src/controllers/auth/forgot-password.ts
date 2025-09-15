import { sendResetPasswordEmail } from "../../email/sendmail";
import prisma from "../../utils/prisma";
import express from "express";

const forgotPassword = async (req: express.Request, res: express.Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //reset token
    const resetToken = crypto.randomUUID();
    const resetTokenExp = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExp,
      },
    });
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to set reset token",
      });
    }
    console.log("Password reset token for testing:", resetToken);
    await sendResetPasswordEmail(email, resetToken);

    return res.status(200).json({
      success: true,
      message: "Reset password email sent",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default forgotPassword;
