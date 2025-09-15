import express from "express";
import prisma from "../../utils/prisma";
import { generateVerificationCode } from "../../utils/authentication";
import { sendVerificationEmail } from "../../email/sendmail";

const resendVerificationCode = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
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

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    const newVerificationCode = generateVerificationCode();

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: newVerificationCode,
        verificationExp: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
    console.log("New verification code for testing:", newVerificationCode);

    // TODO: Send email with new verification code
    await sendVerificationEmail(user.email, newVerificationCode);

    return res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default resendVerificationCode;
