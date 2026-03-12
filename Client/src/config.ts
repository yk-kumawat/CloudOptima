// config.ts
// Centralize configuration variables here for easy access and deployment.

// Using Vite's environment variables. 
// For local development, it will default to localhost:3000 if VITE_API_URL is not provided in .env
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
