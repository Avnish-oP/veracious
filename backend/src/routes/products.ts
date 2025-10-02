import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  getTrendingProducts,
} from "../controllers/products/getProduct";
import { authMiddleware } from "../middlewares/authmiddleware";
import express from "express";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:productId", getProductById);
router.get("/trending", getTrendingProducts);

export default router;
