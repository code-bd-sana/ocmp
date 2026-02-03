import { isMongoId } from 'validator';
import { z } from 'zod';
import { validate } from '../../handlers/zod-error-handler';

/**
 * Tracking Validation Schemas and Types
 *
 * This module defines Zod schemas for validating tracking-related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single tracking.
 * 
 * → Add all **required** fields here
 */
const zodCreateTrackingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Tracking name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreateTrackingInput = z.infer<typeof zodCreateTrackingSchema>;

/**
 * Zod schema for validating **bulk creation** (array of tracking objects).
 */
const zodCreateManyTrackingSchema = z
  .array(zodCreateTrackingSchema)
  .min(1, { message: 'At least one tracking must be provided for bulk creation' });

export type CreateManyTrackingInput = z.infer<typeof zodCreateManyTrackingSchema>;

/**
 * Zod schema for validating data when **updating** an existing tracking.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateTrackingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateTrackingInput = z.infer<typeof zodUpdateTrackingSchema>;

/**
 * Zod schema for validating bulk updates (array of partial tracking objects).
 */
const zodUpdateManyTrackingForBulkSchema = zodUpdateTrackingSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple tracking updates.
 */
const zodUpdateManyTrackingSchema = z
  .array(zodUpdateManyTrackingForBulkSchema)
  .min(1, { message: 'At least one tracking update object must be provided' });

export type UpdateManyTrackingInput = z.infer<typeof zodUpdateManyTrackingSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateTracking = validate(zodCreateTrackingSchema);
export const validateCreateManyTracking = validate(zodCreateManyTrackingSchema);
export const validateUpdateTracking = validate(zodUpdateTrackingSchema);
export const validateUpdateManyTracking = validate(zodUpdateManyTrackingSchema);