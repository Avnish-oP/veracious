import express from "express";
import { authMiddleware } from "../middlewares/authmiddleware";
import { cacheMiddleware } from "../middlewares/cache";
import {
  createReview,
  getProductReviews,
  canReview,
  deleteReview,
} from "../controllers/reviews";

const router = express.Router();

// Get reviews for a product (public, cached for 30 minutes)
router.get("/product/:productId", cacheMiddleware(1800), getProductReviews);

// Check if user can review a product (authenticated)
router.get("/can-review/:productId", authMiddleware, canReview);

// Create a review (authenticated)
router.post("/", authMiddleware, createReview);

// Delete own review (authenticated)
router.delete("/:reviewId", authMiddleware, deleteReview);

export default router;
