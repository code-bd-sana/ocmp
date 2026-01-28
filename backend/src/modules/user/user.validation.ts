import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * User Validation Schemas and Types
 *
 * This module defines Zod schemas for validating user-related
 * requests such as creating, updating, and searching for users.
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Additionally, named validator middleware functions are exported for use
 * in Express routes to validate incoming requests against the defined schemas.
 */

/**
 *
 * Zod schema for validating profile info basic information.
 */
export const profileInfoSchema = z.object({
  fullName: z
    .string({ message: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
});

export type ProfileInfoInput = z.infer<typeof profileInfoSchema>;

export const validateUpdateUser = validate(profileInfoSchema);

/**
 * Helper (assuming you have something like this)
 */
function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return zodErrorHandler(req, res, result.error);
    }

    // Optional: attach validated & typed data
    req.body = result.data;

    next();
  };
}
