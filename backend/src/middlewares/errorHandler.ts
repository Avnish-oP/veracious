import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only log errors in development or for 5xx errors
  if (process.env.NODE_ENV !== "production" || err.statusCode >= 500) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack in development, and don't send null in production
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
