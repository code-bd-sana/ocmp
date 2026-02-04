import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * SubscriptionPlan Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subscriptionPlan-related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single subscriptionPlan.
 * 
 * → Add all **required** fields here
 */
const zodCreateSubscriptionPlanSchema = z
  .object({
    // Subscription plan name, e.g., "Premium Plan", "Max Plan"
    name: z
      .string({ message: "Name must be a string" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),

    // Plan type: determines if the plan is FREE, PAID, or CUSTOM
    planType: z.enum(['FREE', 'PAID', 'CUSTOM'], { message: "Plan type must be one of: FREE, PAID, or CUSTOM" }),

    // Applicable account type: defines which account can use this plan
    applicableAccountType: z.enum(['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'], {
      message: "Applicable account type must be STANDALONE, TRANSPORT_MANAGER, or BOTH",
    }),

    // Plan description
    description: z.string({ message: "Description must be a string" }).optional(),

    // Plan status: true if active, false if inactive
    isActive: z.boolean({ message: "isActive must be a boolean value" }).optional(),
  })
  .strict();

export type CreateSubscriptionPlanInput = z.infer<typeof zodCreateSubscriptionPlanSchema>;

/**
 * Zod schema for validating **bulk creation** (array of subscriptionPlan objects).
 */
const zodCreateManySubscriptionPlanSchema = z
  .array(zodCreateSubscriptionPlanSchema)
  .min(1, { message: 'At least one subscriptionPlan must be provided for bulk creation' });

export type CreateManySubscriptionPlanInput = z.infer<typeof zodCreateManySubscriptionPlanSchema>;

/**
 * Zod schema for validating data when **updating** an existing subscriptionPlan.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateSubscriptionPlanSchema = z
   .object({
    // Subscription plan name, e.g., "Premium Plan", "Max Plan"
    name: z
      .string({ message: "Name must be a string" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters").optional(),

    // Plan type: determines if the plan is FREE, PAID, or CUSTOM
    planType: z.enum(['FREE', 'PAID', 'CUSTOM'], { message: "Plan type must be one of: FREE, PAID, or CUSTOM" }).optional(),

    // Applicable account type: defines which account can use this plan
    applicableAccountType: z.enum(['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'], {
      message: "Applicable account type must be STANDALONE, TRANSPORT_MANAGER, or BOTH",
    }).optional(),

    // Plan description
    description: z.string({ message: "Description must be a string" }).optional(),

    // Plan status: true if active, false if inactive
    isActive: z.boolean({ message: "isActive must be a boolean value" }).optional(),
  })
  .strict();

export type UpdateSubscriptionPlanInput = z.infer<typeof zodUpdateSubscriptionPlanSchema>;

/**
 * Zod schema for validating bulk updates (array of partial subscriptionPlan objects).
 */
const zodUpdateManySubscriptionPlanForBulkSchema = zodUpdateSubscriptionPlanSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple subscriptionPlan updates.
 */
const zodUpdateManySubscriptionPlanSchema = z
  .array(zodUpdateManySubscriptionPlanForBulkSchema)
  .min(1, { message: 'At least one subscriptionPlan update object must be provided' });

export type UpdateManySubscriptionPlanInput = z.infer<typeof zodUpdateManySubscriptionPlanSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSubscriptionPlan = validateBody(zodCreateSubscriptionPlanSchema);
export const validateCreateManySubscriptionPlan = validateBody(zodCreateManySubscriptionPlanSchema);
export const validateUpdateSubscriptionPlan = validateBody(zodUpdateSubscriptionPlanSchema);
export const validateUpdateManySubscriptionPlan = validateBody(zodUpdateManySubscriptionPlanSchema);