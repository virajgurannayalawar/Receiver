import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

const base64Secret = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

const serviceAccount = JSON.parse(
  Buffer.from(base64Secret, "base64").toString("utf8")
);

// Initialize using the modular initializeApp and cert helper
const app = initializeApp({
  credential: cert(serviceAccount)
});

// Export the auth service so AuthController.js can import and use it directly
export const auth = getAuth(app);
