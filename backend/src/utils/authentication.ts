import redisClient from "../lib/redis";
import jwt from "jsonwebtoken";
import express from "express";
import crypto from "crypto";

export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
  domain:
    process.env.NODE_ENV === "production"
      ? ".otticamart.com" // Share cookies across subdomains
      : undefined,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Options for clearCookie — same as cookieOptions but without maxAge
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { maxAge: _, ...cookieClearBase } = cookieOptions;
export const cookieClearOptions = cookieClearBase;

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
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, cookieOptions);
};
