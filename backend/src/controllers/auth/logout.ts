import redisClient from "../../lib/redis";
import express from "express";
import jwt from "jsonwebtoken";

export const logoutUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "No refresh token provided",
      });
    }
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
    await redisClient.del(`refreshToken:${userId}`);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while logging out",
    });
  }
};
export default logoutUser;
