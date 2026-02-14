import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating subscription plan creation (POST)
 */
export const zodCreateSubscriptionPlanSchema = z
  .object({
    name: z
      .string({ message: 'Plan name is required' })
      .min(2, { message: 'Plan name must be at least 2 characters' })
      .max(100, { message: 'Plan name is too long' })
      .trim(),
    planType: z
      .enum(['FREE', 'PAID', 'CUSTOM'], { message: 'Invalid plan type' })
      .refine((value) => value !== undefined, { message: 'Plan type is required' }), // Fix here using refine
    applicableAccountType: z
      .enum(['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'], {
        message: 'Invalid applicable account type',
      })
      .refine((value) => value !== undefined, { message: 'Applicable account type is required' }), // Fix here using refine
    description: z.string().max(500, { message: 'Description is too long' }).optional(),
    isActive: z.boolean({ message: 'isActive must be a boolean' }).optional(),
  })
  .strict();

export type CreateSubscriptionPlanInput = z.infer<typeof zodCreateSubscriptionPlanSchema>;

/**
 * Zod schema for validating subscription plan update (PATCH)
 */
export const zodUpdateSubscriptionPlanSchema = zodCreateSubscriptionPlanSchema.partial();
/* z
  .object({
    name: z
      .string({ message: 'Plan name is required' })
      .min(2, { message: 'Plan name must be at least 2 characters' })
      .max(100, { message: 'Plan name is too long' })
      .trim()
      .optional(),
    planType: z.enum(['FREE', 'PAID', 'CUSTOM'], { message: 'Invalid plan type' }).optional(),
    applicableAccountType: z
      .enum(['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'], {
        message: 'Invalid applicable account type',
      })
      .optional(),
    description: z.string().max(500, { message: 'Description is too long' }).optional(),
    isActive: z.boolean({ message: 'isActive must be a boolean' }).optional(),
  })
  .strict(); */

export type UpdateSubscriptionPlanInput = z.infer<typeof zodUpdateSubscriptionPlanSchema>;

/**
 * Export named validators (as used in your router)
 */
export const validateCreateSubscriptionPlan = validateBody(zodCreateSubscriptionPlanSchema);
// zodCreateSubscriptionPlanSchema.parse(data);
export const validateUpdateSubscriptionPlan = validateBody(zodUpdateSubscriptionPlanSchema);
