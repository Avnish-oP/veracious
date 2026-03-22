import logoutUser from "../controllers/auth/logout";
import loginUser from "../controllers/auth/login";
import registerUser from "../controllers/auth/registeration";
import express from "express";
import verifyUser from "../controllers/auth/verify";
import refreshTokenHandler from "../controllers/auth/refreshToken";
import getCurrentUser from "../controllers/auth/me";
import resendVerificationCode from "../controllers/auth/resendVerification";
import registerStep2 from "../controllers/auth/registerStep2";
import forgotPassword from "../controllers/auth/forgot-password";
import resetPassword from "../controllers/auth/reset-password";
import { authMiddleware } from "../middlewares/authmiddleware";
import rateLimit from "express-rate-limit";

// Strict rate limiter for brute-force-sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
});

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);
router.post("/verify", authLimiter, verifyUser);
router.post("/refresh-token", refreshTokenHandler);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/resend-verification", authLimiter, resendVerificationCode);
router.post("/register-step-2", authMiddleware, registerStep2);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
