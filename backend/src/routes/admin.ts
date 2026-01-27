import express from "express";
import { adminMiddleware, authMiddleware } from "../middlewares/authmiddleware";
import { getUploadUrl } from "../controllers/admin/storageUpload";
import { createProduct, getAdminProducts, updateProduct, deleteProduct } from "../controllers/admin/productManagement";
import { getDashboardStats } from "../controllers/admin/dashboard";

const router = express.Router();

// Apply Auth and Admin Middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// -- Dashboard --
router.get("/dashboard", getDashboardStats);

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

// -- Orders --
import { getAdminOrders, getOrderDetails, updateOrderStatus } from "../controllers/admin/orderManagement";
import { downloadAdminInvoice } from "../controllers/order/invoice";

router.get("/orders", getAdminOrders);
router.get("/orders/:id", getOrderDetails);
router.get("/orders/:id/invoice", downloadAdminInvoice);
router.put("/orders/:id", updateOrderStatus);

// -- Coupons --
import { getAdminCoupons, getCouponById, createCoupon, updateCoupon, deleteCoupon } from "../controllers/admin/couponManagement";

router.get("/coupons", getAdminCoupons);
router.get("/coupons/:id", getCouponById);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;
