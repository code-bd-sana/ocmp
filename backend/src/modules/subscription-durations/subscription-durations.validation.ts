import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                         CREATE SUBSCRIPTION VALIDATION                     */
/* -------------------------------------------------------------------------- */

/**
 * @route POST /api/v1/subscription-duration
 * @description Create a new subscription duration
 * @access Private
 * @param {string} name - Name of the subscription duration (converted to uppercase)
 * @param {number} durationInDays - Duration of the subscription in days
 * @param {boolean} [isActive] - Status of the subscription (default: true)
 * @param {string} createdBy - ObjectId reference of the user
 */

export const createSubscriptionDurationValidation = z.object({
  name: z
    .string({ message: 'Subscription name is required' })
    .min(1, 'Subscription name cannot be empty')
    .trim()
    .transform((val) => val.toUpperCase()),

  durationInDays: z.number({ message: 'Duration in days is required' }),

  isActive: z.boolean().optional().default(true),

  createdBy: z
    .string({ message: 'createdBy (User ID) is required' })
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid ObjectId format for createdBy',
    }),
});

export type TCreateSubscriptionDuration = z.infer<typeof createSubscriptionDurationValidation>;

/* -------------------------------------------------------------------------- */
/*                         UPDATE SUBSCRIPTION VALIDATION                     */
/* -------------------------------------------------------------------------- */

/**
 * @route PATCH /api/v1/subscription-duration/:id
 * @description Update subscription duration
 * @access Private
 * @param {string} [name] - Updated name
 * @param {number} [durationInDays] - Updated duration
 * @param {boolean} [isActive] - Updated status
 */

export const updateSubscriptionDurationValidation = z.object({
  name: z
    .string()
    .min(1, 'Subscription name cannot be empty')
    .trim()
    .transform((val) => val.toUpperCase())
    .optional(),

  durationInDays: z
    .number()
    .int('Duration must be an integer')
    .positive('Duration must be greater than 0')
    .optional(),

  isActive: z.boolean().optional(),
});

export type TUpdateSubscriptionDuration = z.infer<typeof updateSubscriptionDurationValidation>;

/* -------------------------------------------------------------------------- */
/*                            PARAM ID VALIDATION                             */
/* -------------------------------------------------------------------------- */

export const subscriptionDurationIdParamValidation = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid subscription duration ID',
  }),
});

/* -------------------------------------------------------------------------- */
/*                             GENERIC VALIDATE MIDDLEWARE                    */
/* -------------------------------------------------------------------------- */

export const validate =
  (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.errors,
      });
    }
  };

/* -------------------------------------------------------------------------- */
/*                         EXPORTED VALIDATION MIDDLEWARES                    */
/* -------------------------------------------------------------------------- */

export const validateCreateSubscriptionDuration = validate(createSubscriptionDurationValidation);

export const validateUpdateSubscriptionDuration = validate(updateSubscriptionDurationValidation);
