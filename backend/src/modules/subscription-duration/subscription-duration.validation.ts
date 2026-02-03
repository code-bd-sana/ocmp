import { z } from 'zod';
import { validate } from '../../handlers/zod-error-handler';

/**
 * Subscription Duration Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscription duration-related
 * requests such as creating and updating subscription durations.
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Additionally, named validator middleware functions are exported for use
 * in Express routes to validate incoming requests against the defined schemas.
 */

/**
 * Zod schema for validating subscriptionDuration data during creation.
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

export const zodCreateManySubscriptionDurationSchema = z.array(zodCreateSubscriptionDurationSchema);

/**
 * Zod schema for validating subscriptionDuration data during updates.
 */
export const zodUpdateSubscriptionDurationSchema = z
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

export type UpdateSubscriptionDurationInput = z.infer<typeof zodUpdateSubscriptionDurationSchema>;

export const zodUpdateManySubscriptionDurationSchema = z.array(zodUpdateSubscriptionDurationSchema);

/**
 * Export named validators (express middleware creators) for use in routes.
 */
export const validateCreateSubscriptionDuration = validate(zodCreateSubscriptionDurationSchema);
export const validateCreateManySubscriptionDuration = validate(
  zodCreateManySubscriptionDurationSchema
);
export const validateUpdateSubscriptionDuration = validate(zodUpdateSubscriptionDurationSchema);
export const validateUpdateManySubscriptionDuration = validate(
  zodUpdateManySubscriptionDurationSchema
);
