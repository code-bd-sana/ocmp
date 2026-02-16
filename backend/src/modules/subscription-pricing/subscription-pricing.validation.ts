import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating subscription pricing creation.
 */
export const zodCreateSubscriptionPricingSchema = z.object({
  subscriptionPlanId: z.string().nonempty('Subscription plan ID is required'),
  subscriptionDurationId: z.string().nonempty('Subscription duration ID is required'),
  price: z.number().positive('Price must be a positive number'),
  currency: z.string().default('GBP'),
  isActive: z.boolean().default(true),
});

export type CreateSubscriptionPricingInput = z.infer<typeof zodCreateSubscriptionPricingSchema>;

/**
 * Zod schema for validating subscription pricing update.
 */
export const zodUpdateSubscriptionPricingSchema = zodCreateSubscriptionPricingSchema.partial();

export type UpdateSubscriptionPricingInput = z.infer<typeof zodUpdateSubscriptionPricingSchema>;

/**
 * Middleware to validate the request body for creating a subscription pricing.
 */
export const validateCreateSubscriptionPricing = validateBody(zodCreateSubscriptionPricingSchema);

/**
 * Middleware to validate the request body for updating a subscription pricing.
 */
export const validateUpdateSubscriptionPricing = validateBody(zodUpdateSubscriptionPricingSchema);
