import { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

/**
 * Middleware to validate request body against a Yup schema.
 * - Validates the incoming request body.
 * - Aborts on all validation errors (abortEarly: false).
 * - Strips unknown fields not defined in the schema.
 * - If valid, replaces `req.body` with the validated data and calls `next()`.
 * - If invalid, sends a 400 response with the validation errors.
 *
 * @param schema Yup validation schema
 */
export const validateSchema = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (err: any) {
      res.status(400).json({
        errors: err.errors || ["Invalid input"],
      });
    }
  };
};
