import express from "express";
import { authMiddleware } from "../middlewares/authmiddleware";
import { listOrders } from "../controllers/order/listOrders";

const router = express.Router();

router.get("/", authMiddleware, listOrders);

export default router;
