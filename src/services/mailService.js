import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function createTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
}

const transporter = createTransporter();

export function isSmtpConfigured() {
  return transporter !== null;
}

export async function sendVerificationEmail({ email, token }) {
  const verificationLink = `${env.clientUrl}/verify-email?token=${token}`;

  if (!transporter) {
    console.log(
      `[DEV MODE] Verification link for ${email}: ${verificationLink}`,
    );
    return;
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to: email,
    subject: "Verify your Converso account",
    text: `Welcome to Converso. Verify your account: ${verificationLink}`,
    html: `<p>Welcome to Converso.</p><p><a href="${verificationLink}">Verify your account</a></p>`,
  });
}

export async function sendPasswordResetEmail({ email, token }) {
  const resetLink = `${env.clientUrl}/reset-password?token=${token}`;

  if (!transporter) {
    console.log(`[DEV MODE] Password reset link for ${email}: ${resetLink}`);
    return;
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to: email,
    subject: "Reset your Converso password",
    text: `Reset your Converso password: ${resetLink}`,
    html: `<p>Reset your Converso password.</p><p><a href="${resetLink}">Reset password</a></p>`,
  });
}
