import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  voice: [
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/aac",
    "audio/x-aac",
    "audio/3gpp"
  ],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function getMediaType(mimeType) {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type;
    }
  }
  return "document";
}

export function validateFile(buffer, mimeType, fileSize) {
  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: "File exceeds maximum size of 50MB" };
  }

  const mediaType = getMediaType(mimeType);
  if (!mediaType) {
    return { valid: false, error: "File type not allowed" };
  }

  return { valid: true, mediaType };
}

export function generateFileName(originalName) {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(12).toString("hex");
  return `${hash}${ext}`;
}

export function saveFile(buffer, fileName) {
  ensureUploadDir();
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${fileName}`;
}

export function deleteFile(fileName) {
  if (!fileName || fileName.startsWith("http")) {
    return;
  }
  const cleanName = fileName.replace(/^\/uploads\//, "");
  const filePath = path.join(UPLOAD_DIR, cleanName);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export function getFileStats(fileName) {
  if (!fileName || fileName.startsWith("http")) {
    return null;
  }
  const cleanName = fileName.replace(/^\/uploads\//, "");
  const filePath = path.join(UPLOAD_DIR, cleanName);
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
      };
    }
  } catch (error) {
    console.error("Error getting file stats:", error);
  }
  return null;
}
