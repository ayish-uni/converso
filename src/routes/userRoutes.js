import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  blockUser,
  changePassword,
  deleteAccount,
  getPublicProfile,
  listUsers,
  searchUsers,
  unblockUser,
  updateAvatar,
  updatePreferences,
  updateTranslationPreferences,
} from "../controllers/userController.js";
import { protect, requireVerified } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/public/:publicId", getPublicProfile);

router.use(protect, requireVerified);

router.get("/", listUsers);
router.get(
  "/search",
  query("q").optional().trim(),
  validateRequest,
  searchUsers,
);
router.patch(
  "/preferences",
  body("preferredLanguage").optional().isLength({ min: 2, max: 10 }).trim(),
  body("chatMode").optional().isIn(["classic", "culture", "modern"]),
  body("theme").optional().isIn(["dark", "light", "neon"]),
  body("culturalTheme")
    .optional()
    .isIn([
      "english",
      "spanish",
      "french",
      "german",
      "italian",
      "portuguese",
      "dutch",
      "polish",
      "chinese",
      "japanese",
      "korean",
      "arabic",
      "hindi",
      "urdu",
      "bengali",
      "turkish",
      "indonesian",
      "russian",
    ]),
  validateRequest,
  updatePreferences,
);
router.patch(
  "/translation-preferences",
  body("autoTranslate").optional().isBoolean(),
  body("displayMode").optional().isIn(["classic", "culture", "modern"]),
  body("audioEnabled").optional().isBoolean(),
  validateRequest,
  updateTranslationPreferences,
);
router.patch(
  "/password",
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8 }),
  validateRequest,
  changePassword,
);
router.patch("/avatar", uploadMiddleware.single("file"), updateAvatar);
router.delete("/me", deleteAccount);
router.post(
  "/:publicId/block",
  param("publicId").notEmpty(),
  validateRequest,
  blockUser,
);
router.delete(
  "/:publicId/block",
  param("publicId").notEmpty(),
  validateRequest,
  unblockUser,
);

export default router;
