import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating testSubscription data during creation.
 */
const zodCreateTestSubscriptionSchema = z
  .object({
    // Define fields required for creating a new testSubscription.
    // Example:
    // filedName: z.string({ message: 'Please provide a filedName.' }).min(1, "Can't be empty."),
    // Following fields are based on SubscriptionPlan schema
    // from backend/src/models/subscription-billing/subscriptionPlan.schema.ts

    // subscripton name like basic, premium etc
    name: z.string({ message: 'Please provide a name.' }).min(1, "Can't be empty."),

    // plan type - free, paid, custom

    planType: z.enum(['FREE', 'PAID', 'CUSTOM'], { message: 'Please provide a valid planType.' }),

    // applicable account - standalone, transport manager, both

    applicableAccountType: z
      .enum(['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'], {
        message: 'Please provide a valid applicableAccountType.',
      })
      .optional(),

    // description of the plan - optional

    description: z.string().optional(),

    // is the plan active - optional

    isActive: z.boolean().optional(),

    // user who created this plan

    createdBy: z.string({ message: 'Please provide createdBy.' }).min(1, "Can't be empty."),
  })

  .strict();

/**
 * Middleware function to validate testSubscription creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateTestSubscription = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for creating a new testSubscription
  const parseResult = zodCreateTestSubscriptionSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple testSubscription data during creation.
 */
const zodCreateManyTestSubscriptionSchema = z.array(zodCreateTestSubscriptionSchema);

/**
 * Middleware function to validate multiple testSubscription creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateManyTestSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parseResult = zodCreateManyTestSubscriptionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

/**
 * Zod schema for validating testSubscription data during updates.
 */
const zodUpdateTestSubscriptionSchema = z
  .object({
    // Define fields required for updating an existing testSubscription.
    // Example:
    // fieldName: z.string({ message: 'Please provide a filedName.' }).optional(), // Fields can be optional during updates

    // subscripton name like basic, premium etc
    name: z.string({ message: 'Please provide a name.' }).min(1, "Can't be empty.").optional(),

    // plan type - free, paid, custom

    planType: z
      .enum(['FREE', 'PAID', 'CUSTOM'], { message: 'Please provide a valid planType.' })
      .optional(),

    // applicable account - standalone, transport manager, both

    applicableAccountType: z
      .enum(['STANDALONE', 'TRANSPORT_MANAGER', 'BOTH'], {
        message: 'Please provide a valid applicableAccountType.',
      })
      .optional(),

    // description of the plan - optional

    description: z.string().optional(),

    // is the plan active - optional

    isActive: z.boolean().optional(),

    // user who created this plan
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update.',
  });

/**
 * Middleware function to validate testSubscription update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateTestSubscription = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for updating an existing testSubscription

  const parseResult = zodUpdateTestSubscriptionSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple testSubscription data during updates.
 */
const zodUpdateManyTestSubscriptionSchema = z.array(zodUpdateTestSubscriptionSchema);

/**
 * Middleware function to validate multiple testSubscription update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateManyTestSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const parseResult = zodUpdateManyTestSubscriptionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

