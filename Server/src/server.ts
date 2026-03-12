import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import optimizationRoutes from "./routes/optimizationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_ENV = process.env.FLASK_URL || "http://localhost:5000/predict";
// Automatically fix the URL if the user forgot to add "/predict" at the end in their Render environment variables
const FLASK_URL = FLASK_ENV.endsWith("/predict") ? FLASK_ENV : `${FLASK_ENV.replace(/\/$/, "")}/predict`;

app.use(cors());
connectDB();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/optimizations", optimizationRoutes);

app.get("/", (req, res) => {
  res.send("BFF Server running with TypeScript + ES Modules");
});

// Bridge endpoint to Flask
app.post("/api/predict", async (req, res) => {
  try {
    console.log("Forwarding request to Flask:", req.body);
    const response = await axios.post(FLASK_URL, req.body);
    res.json(response.data);
  } catch (error: any) {
    console.error("Error communicating with Flask:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Error communicating with ML Model",
      details: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`BFF Server running on http://localhost:${PORT}`);
});
