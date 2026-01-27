import express from "express";
import { authMiddleware } from "../middlewares/authmiddleware";
import { listOrders } from "../controllers/order/listOrders";
import { downloadInvoice } from "../controllers/order/invoice";

const router = express.Router();

router.get("/", authMiddleware, listOrders);
router.get("/:id/invoice", authMiddleware, downloadInvoice);

export default router;

