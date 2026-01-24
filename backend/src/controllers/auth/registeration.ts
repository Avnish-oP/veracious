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
      if (!existing.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 12);
        const verificationCode = generateVerificationCode();
        
        const updatedUser = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            email, // Ensure email is set if it was finding by phone
            passwordHash: hashedPassword,
            phoneNumber,
            verificationToken: verificationCode,
            verificationExp: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        // Verification code sent via email - never log in production
        
        // Use updatedUser for token generation
        const { accessToken, refreshToken } = generateTokens(updatedUser.id);
        await storeRefreshToken(updatedUser.id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        await sendVerificationEmail(updatedUser.email, verificationCode);
        
        return res.status(200).json({
          success: true,
          message: "User registered successfully. Please check your email for verification code.",
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            isVerified: updatedUser.isVerified,
          },
        });
      }

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
    // console.log("Verification code for testing:", verificationCode);
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    //todo send verification email
    await sendVerificationEmail(user.email, verificationCode);
    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email for verification code.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
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
