import {
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductsByCategory,
  getTrendingProducts,
  getProductsFilters,
  getLensPrices,
  getSimilarProducts,
} from "../controllers/products/getProduct";
import { authMiddleware } from "../middlewares/authmiddleware";
import { cacheMiddleware } from "../middlewares/cache";
import express from "express";

const router = express.Router();

router.get("/", cacheMiddleware(3600), getAllProducts); // 1 hour
router.get("/filters", getProductsFilters); // Dynamic filters usually shouldn't be cached deeply or need shorter cache, but user asked for backend routes. Filters change less often. Let's start with basic routes first.
router.get("/featured", cacheMiddleware(43200), getFeaturedProducts); // 12 hours
router.get("/trending", cacheMiddleware(43200), getTrendingProducts); // 12 hours
router.get("/lens-prices", cacheMiddleware(86400), getLensPrices); // 24 hours - very static
router.get("/category/:categoryId", cacheMiddleware(3600), getProductsByCategory); // 1 hour
router.get("/:productId/similar", cacheMiddleware(3600), getSimilarProducts); // 1 hour - similar products
router.get("/:productId", cacheMiddleware(3600), getProductById); // 1 hour

export default router;

