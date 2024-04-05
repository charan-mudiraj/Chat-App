import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
    FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
    FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
    FIREBASE_STORAGE_BUCKET: JSON.stringify(
      process.env.FIREBASE_STORAGE_BUCKET
    ),
    FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(
      process.env.FIREBASE_MESSAGING_SENDER_ID
    ),
    FIREBASE_APP_ID: JSON.stringify(process.env.FIREBASE_APP_ID),
    FIREBASE_MEASUREMENT_ID: JSON.stringify(
      process.env.FIREBASE_MEASUREMENT_ID
    ),
  },
});
