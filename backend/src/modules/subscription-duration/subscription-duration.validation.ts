import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating subscriptionDuration data during creation.
 */
const zodCreateSubscriptionDurationSchema = z
  .object({
    // Subscription duration display name (e.g., Monthly, Weekly)
    name: z
      .string({ message: 'Subscription duration name is required.' })
      .min(1, 'Subscription duration name cannot be empty.'),

    // Duration length in days (e.g., 30, 15, 7)
    durationInDays: z
      .number({ message: 'Duration in days must be a valid number.' })
      .positive('Duration in days must be greater than 0.'),

    // Indicates whether the duration is active
    isActive: z.boolean({
      message: 'isActive must be a boolean value (true or false).',
    }),

    createdBy: z.string({
      message: 'Please provide a valid creator user ID.',
    }),
  })
  .strict();

/**
 * Middleware function to validate subscriptionDuration creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateSubscriptionDuration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Validate the request body for creating a new subscriptionDuration
  const parseResult = zodCreateSubscriptionDurationSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple subscriptionDuration data during creation.
 */
const zodCreateManySubscriptionDurationSchema = z.array(zodCreateSubscriptionDurationSchema);

/**
 * Middleware function to validate multiple subscriptionDuration creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateManySubscriptionDuration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parseResult = zodCreateManySubscriptionDurationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

/**
 * Zod schema for validating subscriptionDuration data during updates.
 */
const zodUpdateSubscriptionDurationSchema = z
  .object({
    // Name of the subscription duration
    name: z
      .string({ message: 'Subscription duration name is required.' }) // Ensure it's a string
      .min(1, 'Subscription duration name cannot be empty.'), // Must not be empty

    // Duration in days for the subscription
    durationInDays: z
      .number({ message: 'Duration in days must be a valid number.' }) // Ensure it's a number
      .positive('Duration in days must be greater than 0.'), // Must be positive

    // Whether the subscription is active or not
    isActive: z.boolean({
      message: 'isActive must be a boolean value (true or false).', // Must be a boolean
    }),
  })
  .strict(); // Disallow extra fields not defined in the schema

/**
 * Middleware function to validate subscriptionDuration update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateSubscriptionDuration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Validate the request body for updating an existing subscriptionDuration
  const parseResult = zodUpdateSubscriptionDurationSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple subscriptionDuration data during updates.
 */
const zodUpdateManySubscriptionDurationSchema = z.array(zodUpdateSubscriptionDurationSchema);

/**
 * Middleware function to validate multiple subscriptionDuration update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateManySubscriptionDuration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parseResult = zodUpdateManySubscriptionDurationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

