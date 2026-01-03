import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  getTrendingProducts,
  getProductsFilters,
} from "../controllers/products/getProduct";
import { authMiddleware } from "../middlewares/authmiddleware";
import express from "express";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/filters", getProductsFilters); // Must be before /:productId
router.get("/featured", getFeaturedProducts);
router.get("/trending", getTrendingProducts); // Must be before /:productId
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:productId", getProductById);

export default router;
