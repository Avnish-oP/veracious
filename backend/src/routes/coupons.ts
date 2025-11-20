import {
  applyCouponCode,
  getCouponsByProductId,
  getCouponsByValue,
} from "../controllers/coupons/getCoupons";
import express from "express";
import { get } from "http";

const router = express.Router();

// Define your coupon routes here

//route for showing available coupons on products page
router.get("/:productId", getCouponsByProductId);
router.get("/by-order-value", getCouponsByValue);

//route for applying coupon code during checkout
router.post("/apply", applyCouponCode);

export default router;
