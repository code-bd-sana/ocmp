import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating user data during creation.
 */
const zodCreateUserSchema = z.object({
  // Define fields required for creating a new user.
  // Example:
  // filedName: z.string({ message: 'Please provide a filedName.' }).min(1, "Can't be empty."),
}).strict();

/**
 * Middleware function to validate user creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateUser = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for creating a new user
  const parseResult = zodCreateUserSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple user data during creation.
 */
const zodCreateManyUserSchema = z.array(zodCreateUserSchema);

/**
 * Middleware function to validate multiple user creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateManyUser = (req: Request, res: Response, next: NextFunction) => {
  const parseResult = zodCreateManyUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

/**
 * Zod schema for validating user data during updates.
 */
const zodUpdateUserSchema = z.object({
  // Define fields required for updating an existing user.
  // Example:
  // fieldName: z.string({ message: 'Please provide a filedName.' }).optional(), // Fields can be optional during updates
}).strict();

/**
 * Middleware function to validate user update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for updating an existing user
  const parseResult = zodUpdateUserSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple user data during updates.
 */
const zodUpdateManyUserSchema = z.array(zodUpdateUserSchema);


/**
 * Middleware function to validate multiple user update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateManyUser = (req: Request, res: Response, next: NextFunction) => {
  const parseResult = zodUpdateManyUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};