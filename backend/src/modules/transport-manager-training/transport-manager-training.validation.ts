import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Transport-manager-training Validation Schemas and Types
 *
 * This module defines Zod schemas for validating transport-manager-training related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single transport-manager-training.
 * 
 * → Add all **required** fields here
 */
const zodCreateTransportManagerTrainingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Transport-manager-training name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreateTransportManagerTrainingInput = z.infer<typeof zodCreateTransportManagerTrainingSchema>;

/**
 * Zod schema for validating **bulk creation** (array of transport-manager-training objects).
 */
const zodCreateManyTransportManagerTrainingSchema = z
  .array(zodCreateTransportManagerTrainingSchema)
  .min(1, { message: 'At least one transport-manager-training must be provided for bulk creation' });

export type CreateManyTransportManagerTrainingInput = z.infer<typeof zodCreateManyTransportManagerTrainingSchema>;

/**
 * Zod schema for validating data when **updating** an existing transport-manager-training.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateTransportManagerTrainingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateTransportManagerTrainingInput = z.infer<typeof zodUpdateTransportManagerTrainingSchema>;

/**
 * Zod schema for validating bulk updates (array of partial transport-manager-training objects).
 */
const zodUpdateManyTransportManagerTrainingForBulkSchema = zodUpdateTransportManagerTrainingSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple transport-manager-training updates.
 */
const zodUpdateManyTransportManagerTrainingSchema = z
  .array(zodUpdateManyTransportManagerTrainingForBulkSchema)
  .min(1, { message: 'At least one transport-manager-training update object must be provided' });

export type UpdateManyTransportManagerTrainingInput = z.infer<typeof zodUpdateManyTransportManagerTrainingSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateTransportManagerTraining = validateBody(zodCreateTransportManagerTrainingSchema);
export const validateCreateManyTransportManagerTraining = validateBody(zodCreateManyTransportManagerTrainingSchema);
export const validateUpdateTransportManagerTraining = validateBody(zodUpdateTransportManagerTrainingSchema);
export const validateUpdateManyTransportManagerTraining = validateBody(zodUpdateManyTransportManagerTrainingSchema);