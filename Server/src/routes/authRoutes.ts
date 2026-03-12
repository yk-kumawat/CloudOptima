import express from "express";
import { registerUser, loginUser, updateProfile, updatePassword, deleteAccount } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.delete("/account", protect, deleteAccount);

export default router;
