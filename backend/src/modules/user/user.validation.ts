import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * User Validation Schemas and Types
 *
 * This module defines Zod schemas for validating user-related
 * requests such as creating, updating, and searching for users.
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Additionally, named validator middleware functions are exported for use
 * in Express routes to validate incoming requests against the defined schemas.
 */

/**
 *
 * Zod schema for validating profile info basic information.
 */
const zodUpdateUserSchema = z
  .object({
    // Define fields required for updating an existing user.
    // Example:
    // fieldName: z.string({ message: 'Please provide a filedName.' }).optional(), // Fields can be optional during updates
  })
  .strict();

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
