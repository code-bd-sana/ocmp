import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Testing Validation Schemas and Types
 *
 * This module defines Zod schemas for validating testing-related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single testing.
 * 
 * → Add all **required** fields here
 */
const zodCreateTestingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Testing name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreateTestingInput = z.infer<typeof zodCreateTestingSchema>;

/**
 * Zod schema for validating **bulk creation** (array of testing objects).
 */
const zodCreateManyTestingSchema = z
  .array(zodCreateTestingSchema)
  .min(1, { message: 'At least one testing must be provided for bulk creation' });

export type CreateManyTestingInput = z.infer<typeof zodCreateManyTestingSchema>;

/**
 * Zod schema for validating data when **updating** an existing testing.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateTestingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateTestingInput = z.infer<typeof zodUpdateTestingSchema>;

/**
 * Zod schema for validating bulk updates (array of partial testing objects).
 */
const zodUpdateManyTestingForBulkSchema = zodUpdateTestingSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple testing updates.
 */
const zodUpdateManyTestingSchema = z
  .array(zodUpdateManyTestingForBulkSchema)
  .min(1, { message: 'At least one testing update object must be provided' });

export type UpdateManyTestingInput = z.infer<typeof zodUpdateManyTestingSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateTesting = validateBody(zodCreateTestingSchema);
export const validateCreateManyTesting = validateBody(zodCreateManyTestingSchema);
export const validateUpdateTesting = validateBody(zodUpdateTestingSchema);
export const validateUpdateManyTesting = validateBody(zodUpdateManyTestingSchema);