import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  clearChat,
  deleteMessage,
  ensureDirectChat,
  getAdminReports,
  getChat,
  getChatMedia,
  getChatSearch,
  getMessages,
  listChats,
  markChatDelivered,
  markChatRead,
  reportMessage,
  sendMessage,
  sendMediaMessage,
  updateChatSettings,
  updateReportStatus,
  deleteChat,
  addReaction,
} from "../controllers/chatController.js";
import { protect, requireAdmin, requireVerified } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { paginationValidator, reportValidator, sendMessageValidator } from "../validators/chatValidators.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.use(protect, requireVerified);

router.get("/chats", listChats);
router.get(
  "/:chatId",
  param("chatId").isMongoId(),
  validateRequest,
  getChat,
);
router.post("/chat", body("receiverId").optional().isMongoId(), body("receiverPublicId").optional().notEmpty(), validateRequest, ensureDirectChat);
router.post("/send", sendMessageValidator, validateRequest, sendMessage);
router.post("/send-media", uploadMiddleware.single("file"), sendMediaMessage);
router.get("/get/:chatId", param("chatId").isMongoId(), paginationValidator, validateRequest, getMessages);
router.patch("/delivered/:chatId", param("chatId").isMongoId(), validateRequest, markChatDelivered);
router.patch("/read/:chatId", param("chatId").isMongoId(), validateRequest, markChatRead);
router.post("/reports", reportValidator, validateRequest, reportMessage);
router.get("/admin/reports", requireAdmin, getAdminReports);
router.patch(
  "/admin/reports/:reportId",
  requireAdmin,
  body("status").notEmpty(),
  validateRequest,
  updateReportStatus
);

// WhatsApp-style features
router.delete(
  "/message/:messageId",
  param("messageId").isMongoId(),
  query("type").optional().isIn(["everyone", "me"]),
  validateRequest,
  deleteMessage
);
router.post(
  "/reaction/:messageId",
  param("messageId").isMongoId(),
  body("emoji").notEmpty(),
  validateRequest,
  addReaction
);
router.get(
  "/:chatId/media",
  param("chatId").isMongoId(),
  paginationValidator,
  validateRequest,
  getChatMedia
);
router.get(
  "/:chatId/search",
  param("chatId").isMongoId(),
  query("q").notEmpty().trim(),
  paginationValidator,
  validateRequest,
  getChatSearch
);
router.patch(
  "/:chatId/settings",
  param("chatId").isMongoId(),
  body("isBlocked").optional().isBoolean(),
  body("isMuted").optional().isBoolean(),
  body("muteUntil").optional().isISO8601(),
  body("wallpaper").optional().isURL(),
  body("theme").optional().isIn(["default", "dark", "light", "neon"]),
  body("mediaVisibility").optional().isIn(["all", "contacts", "none"]),
  validateRequest,
  updateChatSettings
);
router.delete(
  "/:chatId/clear",
  param("chatId").isMongoId(),
  validateRequest,
  clearChat
);
router.delete(
  "/:chatId",
  param("chatId").isMongoId(),
  validateRequest,
  deleteChat
);

export default router;
