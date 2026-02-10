import mongoose from 'mongoose';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * SubscriptionPricing Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscription-pricing related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single subscription-pricing.
 *
 * → Add all **required** fields here
 */
const zodCreateSubscriptionPricingSchema = z
  .object({
    // Subscription Plan ID — must be a valid MongoDB ObjectId
    subscriptionPlanId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Subscription Plan ID is invalid',
    }),
    // Subscription Duration ID — must be a valid MongoDB ObjectId
    subscriptionDurationId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Subscription Duration ID is invalid',
    }),
    // Price of the subscription — must be a number
    price: z.number({
      message: 'Price must be a number',
    }),
    // Currency code — must be a string (e.g., USD, GBP)
    currency: z
      .string({
        message: 'Currency is required',
      })
      .optional(),
    // Status — true if active, false if inactive
    isActive: z
      .boolean({
        message: 'Status is required',
      })
      .optional(),
  })
  .strict();

export type CreateSubscriptionPricingInput = z.infer<typeof zodCreateSubscriptionPricingSchema>;

/**
 * Zod schema for validating data when **updating** an existing subscription-pricing.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateSubscriptionPricingSchema = zodCreateSubscriptionPricingSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateSubscriptionPricingInput = z.infer<typeof zodUpdateSubscriptionPricingSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSubscriptionPricing = validateBody(zodCreateSubscriptionPricingSchema);
export const validateUpdateSubscriptionPricing = validateBody(zodUpdateSubscriptionPricingSchema);
