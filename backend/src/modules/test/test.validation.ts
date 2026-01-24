import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating test data during creation.
 */
const zodCreateTestSchema = z.object({
  // Define fields required for creating a new test.
  // Example:
  // filedName: z.string({ message: 'Please provide a filedName.' }).min(1, "Can't be empty."),
}).strict();

/**
 * Middleware function to validate test creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateTest = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for creating a new test
  const parseResult = zodCreateTestSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple test data during creation.
 */
const zodCreateManyTestSchema = z.array(zodCreateTestSchema);

/**
 * Middleware function to validate multiple test creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateManyTest = (req: Request, res: Response, next: NextFunction) => {
  const parseResult = zodCreateManyTestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

/**
 * Zod schema for validating test data during updates.
 */
const zodUpdateTestSchema = z.object({
  // Define fields required for updating an existing test.
  // Example:
  // fieldName: z.string({ message: 'Please provide a filedName.' }).optional(), // Fields can be optional during updates
}).strict();

/**
 * Middleware function to validate test update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateTest = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for updating an existing test
  const parseResult = zodUpdateTestSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple test data during updates.
 */
const zodUpdateManyTestSchema = z.array(zodUpdateTestSchema);


/**
 * Middleware function to validate multiple test update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateManyTest = (req: Request, res: Response, next: NextFunction) => {
  const parseResult = zodUpdateManyTestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};