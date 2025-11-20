import express from "express";
import {
  getCategories,
  getCategoryBySlug,
} from "../controllers/categories/getCategories";

const router = express.Router();

router.get("/", getCategories);
router.get("/slug/:slug", getCategoryBySlug);

export default router;
