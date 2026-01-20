import express from "express";
import {
  getCategories,
  getCategoryBySlug,
} from "../controllers/categories/getCategories";

import { cacheMiddleware } from "../middlewares/cache";

const router = express.Router();

router.get("/", cacheMiddleware(86400), getCategories); // 24 hours
router.get("/slug/:slug", cacheMiddleware(86400), getCategoryBySlug); // 24 hours

export default router;
