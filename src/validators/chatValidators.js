import { body, query } from "express-validator";

export const sendMessageValidator = [
  body("receiverId").optional().isMongoId(),
  body("receiverPublicId").optional().notEmpty().trim(),
  body("text").isLength({ min: 1, max: 5000 }).trim(),
];

export const reportValidator = [
  body("reportedUserPublicId").notEmpty().trim(),
  body("reason").isLength({ min: 4, max: 500 }).trim().escape(),
  body("messageId").optional().isMongoId(),
];

export const paginationValidator = [
  query("cursor").optional().isISO8601(),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];
