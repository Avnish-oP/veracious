import prisma from "../../utils/prisma";
import express from "express";
import bcrypt from "bcryptjs";
import {
  generateTokens,
  generateVerificationCode,
  setCookies,
  storeRefreshToken,
} from "../../utils/authentication";
import { sendVerificationEmail } from "../../email/sendmail";

const registerUser = async (req: express.Request, res: express.Response) => {
  // Registration logic
  const { name, email, password, phoneNumber } = req.body;
  try {
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });
    if (existing) {
      const conflictField = existing.email === email ? "email" : "phone number";
      return res.status(400).json({
        success: false,
        message: `User with this ${conflictField} already exists`,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phoneNumber: phoneNumber,
        isVerified: false,
        verificationToken: verificationCode,
        verificationExp: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      },
    });
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Failed to create user",
      });
    }
    console.log("Verification code for testing:", verificationCode);
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    //todo send verification email
    await sendVerificationEmail(user.email, verificationCode);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        verificationCode: user.verificationToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default registerUser;
