import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      message: result.array()[0]?.msg || "Validation failed.",
      errors: result.array(),
    });
  }

  next();
}
