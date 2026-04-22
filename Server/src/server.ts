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
const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000/predict";

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

    // Check if the response is HTML (e.g. Render 502/404 sleeping service page)
    const isHtml = error.response?.headers?.['content-type']?.includes('text/html') ||
      (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>'));

    let detailsMessage = error.response?.data || error.message;
    let errorMessage = "Error communicating with ML Model";

    if (isHtml) {
      detailsMessage = "The ML Model service is currently sleeping or unavailable. Render free tier takes 1-2 minutes to wake up.";
      errorMessage = "ML Model is waking up. Please wait a minute and try again.";
    }

    res.status(error.response?.status || 500).json({
      error: errorMessage,
      details: detailsMessage,
    });
  }
});

// Keep ML Model awake to prevent Render free tier spin down
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes
const FLASK_BASE_URL = FLASK_URL.endsWith("/predict") 
  ? FLASK_URL.replace("/predict", "") 
  : FLASK_URL;

const pingMLModel = async () => {
  try {
    console.log(`[Keep-Alive] Pinging ML Model at ${FLASK_BASE_URL}`);
    await axios.get(FLASK_BASE_URL);
    console.log("[Keep-Alive] ML Model ping successful.");
  } catch (error: any) {
    console.error("[Keep-Alive] Error pinging ML Model:", error.message);
  }
};

// Ping immediately on startup to wake it up if it's sleeping
pingMLModel();

// Then set the interval for every 14 minutes
setInterval(pingMLModel, KEEP_ALIVE_INTERVAL);

app.listen(PORT, () => {
  console.log(`BFF Server running on http://localhost:${PORT}`);
});
