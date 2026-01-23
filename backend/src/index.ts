import express from "express";
import dotenv from "dotenv";
import AuthRoutes from "./routes/auth";
import cors from "cors";
import cookieParser from "cookie-parser";
import producRoutes from "./routes/products";
import cartRoutes from "./routes/cart";
import wishlistRoutes from "./routes/whishlist";
import categoriesRoutes from "./routes/categories";
import couponsRoutes from "./routes/coupons";
import orderRoutes from "./routes/checkout";
import addressRoutes from "./routes/address";

import orderListingRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import searchRoutes from "./routes/search";

import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

dotenv.config();

const app = express();

// Security & Production Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

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
app.get("/health", (req, res) => {
  res.status(200).json({ message: "ok" });
});
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "ok" });
});

app.set("trust proxy", 1);

// Global Error Handler
import { errorHandler } from "./middlewares/errorHandler";
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `Ganpati Bappa Morya!, hey bhagwan dukh haro na haro ye bugs jarur har lena🥹🙏 Server is running on port ${PORT}`
    );
  });
}

export default app;
