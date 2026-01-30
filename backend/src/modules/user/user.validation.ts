import { z } from 'zod';
import { validate } from '../../handlers/zod-error-handler';

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
const zodUpdateUserSchema = z
  .object({
    fullName: z
      .string({ message: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long')
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
  })
  .strict();

/**
 * Export named validators (as used in your router)
 */
export const validateUpdateUser = validate(zodUpdateUserSchema);
