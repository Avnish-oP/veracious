import loginUser from "../controllers/auth/login";
import registerUser from "../controllers/auth/registeration";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

export default router;
