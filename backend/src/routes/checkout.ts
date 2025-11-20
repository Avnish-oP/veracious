import express from "express";

import { authMiddleware } from "../middlewares/authmiddleware";
import { createOrder } from "../controllers/order/createOrder";
import { verifyOrder } from "../controllers/order/verifyOrder";
import { razorpayWebhook } from "../controllers/order/webhook";

const router = express.Router();

router.post("/create", authMiddleware, createOrder);
router.post("/verify", authMiddleware, verifyOrder);
router.post("/webhook", express.raw({ type: "*/*" }), razorpayWebhook);

export default router;
