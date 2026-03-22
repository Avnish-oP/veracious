import express from "express";
import dotenv from "dotenv";
import AuthRoutes from "./routes/auth";
import cors from "cors";
import cookieParser from "cookie-parser";
import producRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import wishlistRoutes from "./routes/wishlist";
import categoriesRoutes from "./routes/categories";
import couponsRoutes from "./routes/coupons";
import orderRoutes from "./routes/checkout";
import addressRoutes from "./routes/address";

import orderListingRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import searchRoutes from "./routes/search";
import reviewRoutes from "./routes/reviews";

import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

dotenv.config();

const app = express();

// Trust proxy must be set BEFORE rate limiter so it reads the real client IP
app.set("trust proxy", 1);

// Security & Production Middleware
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server & health checks
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(cookieParser());

const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/products", producRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/coupons", couponsRoutes);
app.use("/api/v1/checkout", orderRoutes);
app.use("/api/v1/address", addressRoutes);
app.use("/api/v1/orders", orderListingRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/reviews", reviewRoutes);
import prisma from "./utils/prisma";
import redisClient from "./lib/redis";

app.get("/health", async (req, res) => {
  try {
    // Verify dependencies are actually reachable
    await prisma.$queryRaw`SELECT 1`;
    await redisClient.ping();
    res.status(200).json({ status: "ok", db: "ok", redis: "ok" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({ status: "degraded", error: String(err) });
  }
});

app.get("/api/v1/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redisClient.ping();
    res.status(200).json({ status: "ok", db: "ok", redis: "ok" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(503).json({ status: "degraded", error: String(err) });
  }
});

// trust proxy is now set before rate limiter (moved above)

// Global Error Handler
import { errorHandler } from "./middlewares/errorHandler";
app.use(errorHandler);

// Start server
// Start server and handle graceful shutdown
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(
      `Ganpati Bappa Morya!, hey bhagwan dukh haro na haro ye bugs jarur har lena🥹🙏 Server is running on port ${PORT}`
    );
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      console.log("HTTP server closed.");
      
      try {
        await prisma.$disconnect();
        console.log("Prisma disconnected.");
      } catch (err) {
        console.error("Error disconnecting Prisma:", err);
      }

      try {
        redisClient.disconnect();
        console.log("Redis disconnected.");
      } catch (err) {
        console.error("Error disconnecting Redis:", err);
      }

      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long (10s)
    setTimeout(() => {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

export default app;
