import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Subscription-trial Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscription-trial related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single subscription-trial.
 *
 * → Add all **required** fields here
 */
const zodCreateSubscriptionTrialSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Subscription-trial name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreateSubscriptionTrialInput = z.infer<typeof zodCreateSubscriptionTrialSchema>;

/**
 * Zod schema for validating **bulk creation** (array of subscription-trial objects).
 */
const zodCreateManySubscriptionTrialSchema = z
  .array(zodCreateSubscriptionTrialSchema)
  .min(1, { message: 'At least one subscription-trial must be provided for bulk creation' });

export type CreateManySubscriptionTrialInput = z.infer<typeof zodCreateManySubscriptionTrialSchema>;

/**
 * Zod schema for validating data when **updating** an existing subscription-trial.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateSubscriptionTrialSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateSubscriptionTrialInput = z.infer<typeof zodUpdateSubscriptionTrialSchema>;

/**
 * Zod schema for validating bulk updates (array of partial subscription-trial objects).
 */
const zodUpdateManySubscriptionTrialForBulkSchema = zodUpdateSubscriptionTrialSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple subscription-trial updates.
 */
const zodUpdateManySubscriptionTrialSchema = z
  .array(zodUpdateManySubscriptionTrialForBulkSchema)
  .min(1, { message: 'At least one subscription-trial update object must be provided' });

export type UpdateManySubscriptionTrialInput = z.infer<typeof zodUpdateManySubscriptionTrialSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSubscriptionTrial = validateBody(zodCreateSubscriptionTrialSchema);
export const validateCreateManySubscriptionTrial = validateBody(
  zodCreateManySubscriptionTrialSchema
);
export const validateUpdateSubscriptionTrial = validateBody(zodUpdateSubscriptionTrialSchema);
export const validateUpdateManySubscriptionTrial = validateBody(
  zodUpdateManySubscriptionTrialSchema
);

