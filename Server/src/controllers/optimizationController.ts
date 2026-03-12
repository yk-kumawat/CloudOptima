import { Request, Response } from "express";
import Optimization from "../models/Optimization.js";

interface AuthRequest extends Request {
    user?: any;
}

// @desc    Get logged in user's saved optimizations
// @route   GET /api/optimizations
// @access  Private
export const getOptimizations = async (req: AuthRequest, res: Response) => {
    try {
        const optimizations = await Optimization.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(optimizations);
    } catch (error: any) {
        console.error("Get Optimizations Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Save a new optimization
// @route   POST /api/optimizations
// @access  Private
export const saveOptimization = async (req: AuthRequest, res: Response) => {
    try {
        const { name, provider, providerName, instanceType, status, inputConfig, predictionResult } = req.body;

        const optimization = new Optimization({
            user: req.user.id,
            name: name || "Untitled Optimization",
            provider,
            providerName,
            instanceType,
            status,
            inputConfig,
            predictionResult
        });

        const createdOptimization = await optimization.save();
        res.status(201).json(createdOptimization);
    } catch (error: any) {
        console.error("Save Optimization Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete an optimization
// @route   DELETE /api/optimizations/:id
// @access  Private
export const deleteOptimization = async (req: AuthRequest, res: Response) => {
    try {
        const optimization = await Optimization.findById(req.params.id);

        if (optimization) {
            // Check if the optimization belongs to the user
            if (optimization.user.toString() !== req.user.id) {
                res.status(401).json({ message: "User not authorized" });
                return;
            }

            await optimization.deleteOne();
            res.status(200).json({ message: "Optimization removed" });
        } else {
            res.status(404).json({ message: "Optimization not found" });
        }
    } catch (error: any) {
        console.error("Delete Optimization Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
