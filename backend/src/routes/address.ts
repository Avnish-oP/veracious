import express from "express";
import { authMiddleware } from "../middlewares/authmiddleware";
import { addAddress } from "../controllers/address/addAddress";
import { getAddresses } from "../controllers/address/getAddresses";
import { deleteAddress } from "../controllers/address/deleteAddress";

const router = express.Router();

router.post("/add", authMiddleware, addAddress);
router.get("/", authMiddleware, getAddresses);
router.delete("/:id", authMiddleware, deleteAddress);

export default router;
