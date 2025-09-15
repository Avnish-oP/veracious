import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../..//utils/authentication";
import prisma from "../../utils/prisma";
import express from "express";
import bcrypt from "bcryptjs";

const loginUser = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while logging in",
    });
  }
};

export default loginUser;
