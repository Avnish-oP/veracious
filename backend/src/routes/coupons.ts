import {
  applyCouponCode,
  getCouponsByProductId,
  getCouponsByValue,
} from "../controllers/coupons/getCoupons";
import express from "express";
import { authMiddleware } from "../middlewares/authmiddleware";

const router = express.Router();

// Specific routes MUST come before parameterized routes
// Otherwise "/by-order-value" matches as "/:productId"
router.get("/by-order-value", getCouponsByValue);
router.get("/:productId", getCouponsByProductId);

// Applying coupon requires authentication for per-user coupon limits
router.post("/apply", authMiddleware, applyCouponCode);

export default router;
