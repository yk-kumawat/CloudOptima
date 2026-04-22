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

// Helper for delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Bridge endpoint to Flask
app.post("/api/predict", async (req, res) => {
  const MAX_RETRIES = 6;
  const RETRY_DELAY_MS = 10000; // 10 seconds

  let attempt = 0;
  let lastError: any;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Forwarding request to Flask (Attempt ${attempt + 1}/${MAX_RETRIES}):`, req.body);
      const response = await axios.post(FLASK_URL, req.body);
      return res.json(response.data);
    } catch (error: any) {
      lastError = error;
      console.error(`Error communicating with Flask (Attempt ${attempt + 1}):`, error.message);

      const status = error.response?.status;
      const isHtml = error.response?.headers?.['content-type']?.includes('text/html');

      // Retry on 5xx errors, 429, HTML responses (Render wake-up pages), or network errors (no status)
      if (!status || status >= 500 || status === 429 || isHtml) {
        attempt++;
        if (attempt < MAX_RETRIES) {
          console.log(`Model is sleeping/busy. Waiting ${RETRY_DELAY_MS / 1000}s before retrying...`);
          await delay(RETRY_DELAY_MS);
          continue;
        }
      }
      
      // If it's a 4xx error (other than 429) or max retries reached, break and return error
      break;
    }
  }

  // Handle final error if all retries failed or loop broken
  const isHtml = lastError.response?.headers?.['content-type']?.includes('text/html') ||
    (typeof lastError.response?.data === 'string' && lastError.response.data.includes('<!DOCTYPE html>'));

  let detailsMessage = lastError.response?.data || lastError.message;
  let errorMessage = "Error communicating with ML Model";

  if (isHtml) {
    detailsMessage = "The ML Model service is still waking up. It took longer than 60 seconds.";
    errorMessage = "ML Model is waking up. Please try again.";
  } else if (lastError.response?.status === 429) {
    detailsMessage = "Render's Free Tier has temporarily rate-limited the server. Please wait a few minutes before trying again.";
    errorMessage = "Render Free Tier Rate Limit Hit";
  }

  res.status(lastError.response?.status || 500).json({
    error: errorMessage,
    details: detailsMessage,
  });
});

app.listen(PORT, () => {
  console.log(`BFF Server running on http://localhost:${PORT}`);
});
