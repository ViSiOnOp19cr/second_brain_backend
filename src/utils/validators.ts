import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

/**
 * Creates a middleware function that validates request parameters against a Zod schema
 * @param schema - Zod schema for validation
 * @param source - Which part of the request to validate ('params', 'query', 'body')
 */
export const validateRequest = <T extends z.ZodTypeAny>(
  schema: T,
  source: 'params' | 'query' | 'body' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[source]);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          err => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }
      
      // Add the validated data back to the request object
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Commonly used validators
export const idParamSchema = z.object({
  id: z.string()
    .transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ID must be a valid number'
        });
        return z.NEVER;
      }
      return parsed;
    })
});

export const hashParamSchema = z.object({
  hash: z.string()
    .min(1, 'Hash cannot be empty')
    .max(100, 'Hash is too long')
});

// Middleware for validating ID parameter
export const validateIdParam = validateRequest(idParamSchema, 'params');

// Middleware for validating hash parameter
export const validateHashParam = validateRequest(hashParamSchema, 'params');

// Content schema for validation
export const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  link: z.string().url("Link must be a valid URL"),
  tags: z.array(z.string()).min(1, "At least one tag is required")
});

// User schema for validation
export const userSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters")
});
