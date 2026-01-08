import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/authmiddleware";
import { getUploadUrl } from "../controllers/admin/storageUpload";
import { createProduct, getAdminProducts, updateProduct, deleteProduct } from "../controllers/admin/productManagement";

const router = express.Router();

// Apply Auth and Admin Middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// -- Dashboard --
router.get("/dashboard", (req, res) => {
    // Placeholder for dashboard stats
    res.json({ success: true, message: "Admin Dashboard Data", stats: { orders: 0, revenue: 0 } });
});

// -- Storage (Supabase) --
router.post("/upload-url", getUploadUrl);

// -- Products --
router.post("/products", createProduct);
router.get("/products", getAdminProducts);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// -- Lens Pricing --
import { getLensPrices, createLensPrice, updateLensPrice, deleteLensPrice } from "../controllers/admin/lensPriceManagement";

router.get("/lens-prices", getLensPrices);
router.post("/lens-prices", createLensPrice);
router.put("/lens-prices/:id", updateLensPrice);
router.delete("/lens-prices/:id", deleteLensPrice);

export default router;
