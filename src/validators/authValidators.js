import { body } from "express-validator";

const allowedLanguages = new Set([
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "nl",
  "pl",
  "ur",
  "hi",
  "ar",
  "zh",
  "ja",
  "ko",
  "bn",
  "tr",
  "id",
  "ru",
]);

export const registerValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters.")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage(
      "Username can only include letters, numbers, dots, underscores, and hyphens.",
    )
    .custom((value) => !value.includes(".."))
    .withMessage("Username format is invalid."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must include at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must include at least one number.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must include at least one special character."),
  body("preferredLanguage")
    .trim()
    .custom((value) => allowedLanguages.has(value))
    .withMessage("Please choose a valid language."),
  body("acceptedTerms")
    .custom((value) => value === true || value === "true")
    .withMessage("You must accept the Terms of Service and Privacy Policy."),
];

export const loginValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

export const forgotPasswordValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
];

export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must include at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must include at least one number.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must include at least one special character."),
];
