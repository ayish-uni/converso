import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getMe,
  login,
  register,
  resendVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  loginValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/authValidators.js";
import { env } from "../config/env.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: env.authWindowMs,
  max: env.authMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

router.post(
  "/register",
  authLimiter,
  registerValidator,
  validateRequest,
  register,
);
router.post("/login", authLimiter, loginValidator, validateRequest, login);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  validateRequest,
  resetPassword,
);
router.get("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", protect, resendVerification);
router.get("/me", protect, getMe);

export default router;
