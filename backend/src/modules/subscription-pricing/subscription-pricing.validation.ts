import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * SubscriptionPricing Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscriptionPricing-related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single subscriptionPricing.
 * 
 * → Add all **required** fields here
 */
const zodCreateSubscriptionPricingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'SubscriptionPricing name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreateSubscriptionPricingInput = z.infer<typeof zodCreateSubscriptionPricingSchema>;

/**
 * Zod schema for validating **bulk creation** (array of subscriptionPricing objects).
 */
const zodCreateManySubscriptionPricingSchema = z
  .array(zodCreateSubscriptionPricingSchema)
  .min(1, { message: 'At least one subscriptionPricing must be provided for bulk creation' });

export type CreateManySubscriptionPricingInput = z.infer<typeof zodCreateManySubscriptionPricingSchema>;

/**
 * Zod schema for validating data when **updating** an existing subscriptionPricing.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateSubscriptionPricingSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateSubscriptionPricingInput = z.infer<typeof zodUpdateSubscriptionPricingSchema>;

/**
 * Zod schema for validating bulk updates (array of partial subscriptionPricing objects).
 */
const zodUpdateManySubscriptionPricingForBulkSchema = zodUpdateSubscriptionPricingSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple subscriptionPricing updates.
 */
const zodUpdateManySubscriptionPricingSchema = z
  .array(zodUpdateManySubscriptionPricingForBulkSchema)
  .min(1, { message: 'At least one subscriptionPricing update object must be provided' });

export type UpdateManySubscriptionPricingInput = z.infer<typeof zodUpdateManySubscriptionPricingSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSubscriptionPricing = validateBody(zodCreateSubscriptionPricingSchema);
export const validateCreateManySubscriptionPricing = validateBody(zodCreateManySubscriptionPricingSchema);
export const validateUpdateSubscriptionPricing = validateBody(zodUpdateSubscriptionPricingSchema);
export const validateUpdateManySubscriptionPricing = validateBody(zodUpdateManySubscriptionPricingSchema);