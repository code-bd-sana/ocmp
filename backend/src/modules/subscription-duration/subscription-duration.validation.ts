import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Subscription Duration Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscription-duration related
 * requests such as creating and updating subscription-durations.
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Additionally, named validator middleware functions are exported for use
 * in Express routes to validate incoming requests against the defined schemas.
 */

/**
 * Zod schema for validating subscription-duration data during creation.
 */
export const zodCreateSubscriptionDurationSchema = z
  .object({
    name: z
      .string({ message: 'Subscription duration name is required.' })
      .min(1, 'Subscription duration name cannot be empty.'),
    durationInDays: z
      .number({ message: 'Duration in days must be a valid number.' })
      .positive('Duration in days must be greater than 0.'),
    isActive: z.boolean({ message: 'isActive must be a boolean value (true or false).' }),
  })
  .strict();

export type CreateSubscriptionDurationInput = z.infer<typeof zodCreateSubscriptionDurationSchema>;

/**
 * Zod schema for validating subscription-duration data during updates.
 */
export const zodUpdateSubscriptionDurationSchema = z
  .object({
    name: z
      .string({ message: 'Subscription duration name is required.' })
      .min(1, 'Subscription duration name cannot be empty.')
      .optional(),
    durationInDays: z
      .number({ message: 'Duration in days must be a valid number.' })
      .positive('Duration in days must be greater than 0.')
      .optional(),
    isActive: z
      .boolean({ message: 'isActive must be a boolean value (true or false).' })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateSubscriptionDurationInput = z.infer<typeof zodUpdateSubscriptionDurationSchema>;

/**
 * Zod schema for validating multiple subscription-duration updates.
 * Each object in the array must include an 'id' field along with at least one other field to update.
 */
export const zodUpdateSubscriptionDurationForBulkSchema = zodUpdateSubscriptionDurationSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field besides id must be provided for update.',
  });

/**
 * Export named validators (express middleware creators) for use in routes.
 */
export const validateCreateSubscriptionDuration = validateBody(zodCreateSubscriptionDurationSchema);
export const validateUpdateSubscriptionDuration = validateBody(zodUpdateSubscriptionDurationSchema);
