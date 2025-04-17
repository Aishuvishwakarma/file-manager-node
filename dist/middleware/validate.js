"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchema = void 0;
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
const validateSchema = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            req.body = yield schema.validate(req.body, { abortEarly: false, stripUnknown: true });
            next();
        }
        catch (err) {
            res.status(400).json({
                errors: err.errors || ["Invalid input"],
            });
        }
    });
};
exports.validateSchema = validateSchema;
