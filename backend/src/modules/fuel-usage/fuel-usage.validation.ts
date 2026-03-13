import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Fuel-usage Validation Schemas and Types
 *
 * This module defines Zod schemas for validating fuel-usage related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single fuel-usage.
 * 
 * → Add all **required** fields here
 */
const zodCreateFuelUsageSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Fuel-usage name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreateFuelUsageInput = z.infer<typeof zodCreateFuelUsageSchema>;

/**
 * Zod schema for validating data when **updating** an existing fuel-usage.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateFuelUsageSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateFuelUsageInput = z.infer<typeof zodUpdateFuelUsageSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateFuelUsage = validateBody(zodCreateFuelUsageSchema);
export const validateUpdateFuelUsage = validateBody(zodUpdateFuelUsageSchema);