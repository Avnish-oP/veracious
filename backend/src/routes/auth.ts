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

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);
router.post("/verify", verifyUser);
router.post("/refresh-token", refreshTokenHandler);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/resend-verification", resendVerificationCode);
router.post("/register-step-2", registerStep2);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
