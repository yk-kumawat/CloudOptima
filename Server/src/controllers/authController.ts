import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret_key_123", {
        expiresIn: "30d",
    });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            res.status(400).json({ message: "Please enter all fields" });
            return;
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                createdAt: (user as any).createdAt,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error: any) {
        console.error("Register Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Please enter all fields" });
            return;
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                createdAt: (user as any).createdAt,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error: any) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            if (req.body.email && req.body.email !== user.email) {
                // Email updates requires verification in a real app, keeping it simple here
                const userExists = await User.findOne({ email: req.body.email });
                if (userExists) {
                    res.status(400).json({ message: "Email already exists" });
                    return;
                }
                user.email = req.body.email;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser.id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                createdAt: (updatedUser as any).createdAt,
                token: generateToken(updatedUser.id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: any) {
        console.error("Update Profile Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePassword = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: "Please provide both current and new passwords" });
                return;
            }
            
            if (!(await bcrypt.compare(currentPassword, user.password))) {
                res.status(401).json({ message: "Invalid current password" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            res.json({ message: "Password updated successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: any) {
        console.error("Update Password Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteAccount = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            await User.deleteOne({ _id: req.user._id });
            res.json({ message: "User removed successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: any) {
        console.error("Delete Account Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
