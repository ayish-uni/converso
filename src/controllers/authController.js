import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { generatePublicId } from "../utils/generatePublicId.js";
import { generateToken } from "../utils/generateToken.js";
import { User } from "../models/User.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isSmtpConfigured,
} from "../services/mailService.js";
import { env } from "../config/env.js";

function buildVerificationWindow() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24);
}

function hashVerificationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function canResendVerification(user) {
  return (
    !user.verificationLastSentAt ||
    Date.now() - user.verificationLastSentAt.getTime() >=
      env.verificationCooldownMs
  );
}

async function issueVerificationToken(user, { force = false } = {}) {
  if (!force && !canResendVerification(user)) {
    return false;
  }

  const rawToken = crypto.randomBytes(24).toString("hex");
  user.verificationToken = rawToken;
  user.verificationTokenHash = hashVerificationToken(rawToken);
  user.verificationTokenExpiresAt = buildVerificationWindow();
  user.verificationLastSentAt = new Date();
  await user.save();
  await sendVerificationEmail({ email: user.email, token: rawToken });
  return true;
}

function buildPasswordResetWindow() {
  return new Date(Date.now() + 1000 * 60 * 60);
}

function canResendPasswordReset(user) {
  return (
    !user.passwordResetLastSentAt ||
    Date.now() - user.passwordResetLastSentAt.getTime() >=
      env.verificationCooldownMs
  );
}

async function issuePasswordResetToken(user, { force = false } = {}) {
  if (!force && !canResendPasswordReset(user)) {
    return { sent: false };
  }

  const rawToken = crypto.randomBytes(24).toString("hex");
  const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}`;

  user.passwordResetToken = rawToken;
  user.passwordResetTokenHash = hashVerificationToken(rawToken);
  user.passwordResetTokenExpiresAt = buildPasswordResetWindow();
  user.passwordResetLastSentAt = new Date();
  await user.save();

  const smtpEnabled = isSmtpConfigured();
  if (!smtpEnabled) {
    console.log(
      `[DEV MODE] Password reset link for ${user.email}: ${resetLink}`,
    );
    return { sent: false, resetLink };
  }

  await sendPasswordResetEmail({ email: user.email, token: rawToken });
  return { sent: true };
}

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, preferredLanguage, acceptedTerms } =
    req.body;

  if (!acceptedTerms) {
    throw new AppError(
      "You must accept the Terms of Service and Privacy Policy.",
      400,
    );
  }
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedUsername = String(username || "")
    .trim()
    .toLowerCase();
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existing) {
    if (!existing.isVerified && existing.email === normalizedEmail) {
      const smtpEnabled = isSmtpConfigured();
      if (!smtpEnabled) {
        // In dev mode, auto-verify the user
        existing.isVerified = true;
        await existing.save();
        res.status(200).json({
          message: "Account verified. You can now login.",
        });
        return;
      }
      const sent = await issueVerificationToken(existing);
      res.status(200).json({
        message: sent
          ? "Account exists but is not verified yet. A fresh verification email has been sent."
          : "Account exists but is not verified yet. Please wait a few minutes before requesting another verification email.",
      });
      return;
    }

    throw new AppError(
      "This email or username is already registered. Please login or choose a different one.",
      409,
    );
  }

  const verificationToken = crypto.randomBytes(24).toString("hex");
  const isAdmin =
    normalizedEmail ===
    String(env.adminEmail || "")
      .trim()
      .toLowerCase();
  const smtpEnabled = isSmtpConfigured();

  const user = await User.create({
    publicId: generatePublicId(),
    email: normalizedEmail,
    username: normalizedUsername,
    password,
    preferredLanguage,
    acceptedTerms: true,
    acceptedTermsAt: new Date(),
    verificationToken: smtpEnabled ? verificationToken : null,
    verificationTokenHash: smtpEnabled
      ? hashVerificationToken(verificationToken)
      : null,
    verificationTokenExpiresAt: smtpEnabled ? buildVerificationWindow() : null,
    verificationLastSentAt: smtpEnabled ? new Date() : null,
    isVerified: !smtpEnabled,
    isAdmin,
  });

  if (smtpEnabled) {
    try {
      await sendVerificationEmail({
        email: user.email,
        token: verificationToken,
      });
      res.status(201).json({
        message: "Account successfully created. Please verify your email.",
      });
    } catch (emailError) {
      console.error("Verification email failed to send:", emailError);
      user.isVerified = true;
      user.verificationToken = null;
      user.verificationTokenHash = null;
      user.verificationTokenExpiresAt = null;
      user.verificationLastSentAt = null;
      await user.save();
      res.status(201).json({
        message:
          "Account successfully created. Verification email delivery failed, but you can now login.",
      });
    }
  } else {
    res.status(201).json({
      message: "Account successfully created. You can now login.",
    });
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const token = String(req.query.token || "").trim();
  if (!token || token.length < 20) {
    throw new AppError("Verification token is invalid or expired.", 400);
  }

  const tokenHash = hashVerificationToken(token);
  const user = await User.findOne({
    verificationTokenHash: tokenHash,
    verificationTokenExpiresAt: { $gt: new Date() },
  }).select("+verificationTokenHash");

  if (!user) {
    throw new AppError("Verification token is invalid or expired.", 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenHash = null;
  user.verificationTokenExpiresAt = null;
  await user.save();

  res.json({ message: "Email verified successfully." });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const normalizedEmail = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.json({
      message:
        "If your email is registered, a password reset link has been sent.",
    });
  }

  const { sent, resetLink } = await issuePasswordResetToken(user);
  return res.json({
    message: sent
      ? "If your email is registered, a password reset link has been sent. Check your inbox."
      : "If your email is registered, a password reset link has been generated. Use the link below to reset your password.",
    resetLink: resetLink || null,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.body.token || "").trim();
  const password = String(req.body.password || "");

  if (!token || token.length < 20) {
    throw new AppError("Password reset token is invalid or expired.", 400);
  }

  const tokenHash = hashVerificationToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash");

  if (!user) {
    throw new AppError("Password reset token is invalid or expired.", 400);
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiresAt = null;
  user.passwordResetLastSentAt = null;
  await user.save();

  res.json({
    message:
      "Password updated successfully. Please login with your new password.",
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isVerified) {
    const sent = await issueVerificationToken(user);
    throw new AppError(
      sent
        ? "Please verify your email first. A fresh verification link has been sent."
        : "Please verify your email first. A verification email was already sent recently.",
      403,
    );
  }

  const token = generateToken(user._id.toString());

  res.json({
    token,
    user: {
      id: user._id.toString(),
      publicId: user.publicId,
      email: user.email,
      username: user.username,
      preferredLanguage: user.preferredLanguage,
      chatMode: user.chatMode,
      theme: user.theme,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  await req.user.populate(
    "blockedUsers",
    "publicId username preferredLanguage",
  );

  res.json({
    user: {
      id: req.user._id.toString(),
      publicId: req.user.publicId,
      email: req.user.email,
      username: req.user.username,
      preferredLanguage: req.user.preferredLanguage,
      chatMode: req.user.chatMode,
      theme: req.user.theme,
      isVerified: req.user.isVerified,
      isAdmin: req.user.isAdmin,
      avatarUrl: req.user.avatarUrl,
      blockedUsers: req.user.blockedUsers,
      createdAt: req.user.createdAt,
    },
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isVerified) {
    throw new AppError("Email is already verified.", 400);
  }

  const sent = await issueVerificationToken(user);
  if (!sent) {
    throw new AppError(
      "Verification email was sent recently. Please wait before requesting another one.",
      429,
    );
  }

  res.json({ message: "Verification email sent successfully." });
});
