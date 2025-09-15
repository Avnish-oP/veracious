import express from "express";
import jwt from "jsonwebtoken";
import {
  generateTokens,
  setCookies,
  storeRefreshToken,
} from "../../utils/authentication";
import redisClient from "../../lib/redis";

const refreshTokenHandler = async (
  req: express.Request,
  res: express.Response
) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "No refresh token provided",
    });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const userId =
      typeof decoded === "object" && "id" in decoded
        ? (decoded as any).id
        : null;
    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token payload",
      });
    }

    const storedToken = await redisClient.get(`refreshToken:${userId}`);
    if (storedToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Refresh token does not match",
      });
    }
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(userId);
    await storeRefreshToken(userId, newRefreshToken);
    setCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh tokens",
    });
  }
};

export default refreshTokenHandler;
