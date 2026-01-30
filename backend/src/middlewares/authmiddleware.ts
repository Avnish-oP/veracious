import prisma from "../utils/prisma";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import redisClient from "../lib/redis";
import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../utils/authentication";

// Extend Express Request to include typed user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Helper function to attempt token refresh
 * Returns the user if refresh succeeds, null otherwise
 */
const attemptTokenRefresh = async (
  req: Request,
  res: Response,
): Promise<User | null> => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return null;
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as { id: string };

    if (!decoded?.id) {
      return null;
    }

    // Check if refresh token matches the one stored in Redis
    const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);
    if (storedToken !== refreshToken) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return null;
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      generateTokens(user.id);

    // Store new refresh token in Redis
    await storeRefreshToken(user.id, newRefreshToken);

    // Set new cookies in response
    setCookies(res, newAccessToken, newRefreshToken);

    return user;
  } catch (error) {
    console.error("Token refresh failed in middleware:", error);
    return null;
  }
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies?.accessToken;

  // Try to verify access token first
  if (accessToken) {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!,
      ) as { id: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      // Access token is invalid or expired, will try refresh token below
    }
  }

  // Access token missing or invalid - try to refresh using refresh token
  const user = await attemptTokenRefresh(req, res);

  if (user) {
    req.user = user;
    return next();
  }

  // Both tokens invalid or missing
  return res.status(401).json({
    success: false,
    message: "Authentication required",
  });
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }

  return next();
};
