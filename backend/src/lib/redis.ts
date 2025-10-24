import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL as string, {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTimeout: 10000,
  // TLS configuration for Upstash
  tls: {
    rejectUnauthorized: false,
  },
});

// Handle Redis errors
redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("ready", () => {
  console.log("Redis client ready");
});

redisClient.on("reconnecting", () => {
  console.log("Redis client reconnecting...");
});

export default redisClient;

async function verifyRedisConnection() {
  try {
    await redisClient.ping();
    console.log("✅ Redis connection established successfully");
  } catch (error) {
    console.error("❌ Error connecting to Redis:", error);
  }
}

verifyRedisConnection();
