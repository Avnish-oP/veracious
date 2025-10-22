import {
  addToWishlist,
  getwishlist,
  removeWishlistItem,
} from "../controllers/wishlist/wishlist";
import { authMiddleware } from "../middlewares/authmiddleware";
import express from "express";

const router = express.Router();

router.get("/", authMiddleware, getwishlist);
router.post("/toggle/:productId", authMiddleware, addToWishlist);

export default router;
