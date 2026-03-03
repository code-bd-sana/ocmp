import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Planner Validation Schemas and Types
 *
 * This module defines Zod schemas for validating planner related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single planner.
 * 
 * → Add all **required** fields here
 */
const zodCreatePlannerSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Planner name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreatePlannerInput = z.infer<typeof zodCreatePlannerSchema>;

/**
 * Zod schema for validating data when **updating** an existing planner.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdatePlannerSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdatePlannerInput = z.infer<typeof zodUpdatePlannerSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreatePlanner = validateBody(zodCreatePlannerSchema);
export const validateUpdatePlanner = validateBody(zodUpdatePlannerSchema);