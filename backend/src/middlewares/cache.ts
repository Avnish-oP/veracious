import { Request, Response, NextFunction } from "express";
import redisClient from "../lib/redis";

/**
 * Middleware to cache responses in Redis
 * @param duration seconds to cache the response
 */
export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests just in case it's applied incorrectly
    if (req.method !== "GET") {
      return next();
    }

    try {
      // Create a unique key based on the URL (includes path + query params)
      const key = `cache:${req.originalUrl || req.url}`;

      const cachedData = await redisClient.get(key);

      if (cachedData) {
        // console.log(`Cache hit for ${key}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Hook into res.json (and res.send) to capture the response
      const originalJson = res.json;
      
      res.json = (body: any): Response<any, Record<string, any>> => {
        // Restore original method
        res.json = originalJson;
        
        // Store in Redis without blocking the response
        try {
            // Only cache successful responses (status 2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                redisClient.set(key, JSON.stringify(body), "EX", duration)
                   .catch(err => console.error("Redis set error:", err));
            }
        } catch (err) {
            console.error("Error caching response:", err);
        }

        // Send the response
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      console.error("Cache Middleware Error:", error);
      next(); // Proceed without caching on error
    }
  };
};
