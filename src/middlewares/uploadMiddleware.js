import multer from "multer";
import { AppError } from "../utils/appError.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ALLOWED_TYPES = {
    image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    voice: ["audio/mpeg", "audio/wav", "audio/webm", "audio/ogg"],
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

  const isAllowed = Object.values(ALLOWED_TYPES).some((types) => types.includes(file.mimetype));

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new AppError("File type not allowed.", 400), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
