import { authMiddleware } from "../middlewares/authmiddleware";
import {
  addToCart,
  getCart,
  mergeCarts,
  productDetails,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart/addCart";
import express from "express";

const router = express.Router();

router.post("/add", authMiddleware, addToCart);

router.get("/", authMiddleware, getCart);

router.put("/update/:itemId", authMiddleware, updateCartItem);

router.delete("/remove/:itemId", authMiddleware, removeCartItem);

router.post("/merge", authMiddleware, mergeCarts);
router.get("/product/:productId", productDetails);

export default router;
