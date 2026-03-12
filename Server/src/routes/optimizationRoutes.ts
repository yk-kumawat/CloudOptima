import express from "express";
import { getOptimizations, saveOptimization, deleteOptimization } from "../controllers/optimizationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getOptimizations).post(protect, saveOptimization);
router.route("/:id").delete(protect, deleteOptimization);

export default router;
