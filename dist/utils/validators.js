"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.contentSchema = exports.validateHashParam = exports.validateIdParam = exports.hashParamSchema = exports.idParamSchema = exports.validateRequest = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
/**
 * Creates a middleware function that validates request parameters against a Zod schema
 * @param schema - Zod schema for validation
 * @param source - Which part of the request to validate ('params', 'query', 'body')
 */
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req[source]);
            if (!result.success) {
                const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                throw new errorHandler_1.AppError(`Validation failed: ${errorMessages}`, 400);
            }
            // Add the validated data back to the request object
            req[source] = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
// Commonly used validators
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string()
        .transform((val, ctx) => {
        const parsed = parseInt(val);
        if (isNaN(parsed)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: 'ID must be a valid number'
            });
            return zod_1.z.NEVER;
        }
        return parsed;
    })
});
exports.hashParamSchema = zod_1.z.object({
    hash: zod_1.z.string()
        .min(1, 'Hash cannot be empty')
        .max(100, 'Hash is too long')
});
// Middleware for validating ID parameter
exports.validateIdParam = (0, exports.validateRequest)(exports.idParamSchema, 'params');
// Middleware for validating hash parameter
exports.validateHashParam = (0, exports.validateRequest)(exports.hashParamSchema, 'params');
// Content schema for validation
exports.contentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    type: zod_1.z.string().min(1, "Type is required"),
    link: zod_1.z.string().url("Link must be a valid URL"),
    tags: zod_1.z.array(zod_1.z.string()).min(1, "At least one tag is required")
});
// User schema for validation
exports.userSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters"),
    password: zod_1.z.string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must be at most 30 characters")
});
