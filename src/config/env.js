import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/converso",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5174",
  deeplApiKey: process.env.DEEPL_API_KEY || "",
  deeplApiUrl:
    process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2/translate",
  googleApiKey: process.env.GOOGLE_API_KEY || "",
  googleTranslateApiUrl:
    process.env.GOOGLE_TRANSLATE_API_URL ||
    "https://translation.googleapis.com/language/translate/v2",
  googleDetectApiUrl:
    process.env.GOOGLE_DETECT_API_URL ||
    "https://translation.googleapis.com/language/translate/v2/detect",
  translationTimeoutMs: Number(process.env.TRANSLATION_TIMEOUT_MS || 8000),
  emailFrom: process.env.EMAIL_FROM || "no-reply@example.com",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  adminEmail: process.env.ADMIN_EMAIL || "admin@example.com",
  authWindowMs: Number(process.env.AUTH_WINDOW_MS || 15 * 60 * 1000),
  authMaxAttempts: Number(process.env.AUTH_MAX_ATTEMPTS || 20),
  verificationCooldownMs: Number(
    process.env.VERIFICATION_COOLDOWN_MS || 5 * 60 * 1000,
  ),
};
