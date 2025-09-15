import redisClient from "../lib/redis";
import jwt from "jsonwebtoken";
import express from "express";

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const generateTokens = (userId: string) => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
  const accessToken = jwt.sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15m",
    }
  );

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (
  userId: string,
  providedToken: string
) => {
  await redisClient.set(
    `refreshToken:${userId}`,
    providedToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

export const setCookies = (
  res: express.Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    ...cookiesOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, cookiesOptions);
};
