import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import zodErrorHandler from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating blog data during creation.
 */
const zodCreateBlogSchema = z.object({
  // Define fields required for creating a new blog.
  // Example:
  // filedName: z.string({ message: 'Please provide a filedName.' }).min(1, "Can't be empty."),
}).strict();

/**
 * Middleware function to validate blog creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateBlog = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for creating a new blog
  const parseResult = zodCreateBlogSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple blog data during creation.
 */
const zodCreateManyBlogSchema = z.array(zodCreateBlogSchema);

/**
 * Middleware function to validate multiple blog creation data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateCreateManyBlog = (req: Request, res: Response, next: NextFunction) => {
  const parseResult = zodCreateManyBlogSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};

/**
 * Zod schema for validating blog data during updates.
 */
const zodUpdateBlogSchema = z.object({
  // Define fields required for updating an existing blog.
  // Example:
  // fieldName: z.string({ message: 'Please provide a filedName.' }).optional(), // Fields can be optional during updates
}).strict();

/**
 * Middleware function to validate blog update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateBlog = (req: Request, res: Response, next: NextFunction) => {
  // Validate the request body for updating an existing blog
  const parseResult = zodUpdateBlogSchema.safeParse(req.body);

  // If validation fails, send an error response using the Zod error handler
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }

  // If validation passes, proceed to the next middleware function
  return next();
};

/**
 * Zod schema for validating multiple blog data during updates.
 */
const zodUpdateManyBlogSchema = z.array(zodUpdateBlogSchema);


/**
 * Middleware function to validate multiple blog update data using Zod schema.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {void}
 */
export const validateUpdateManyBlog = (req: Request, res: Response, next: NextFunction) => {
  const parseResult = zodUpdateManyBlogSchema.safeParse(req.body);
  if (!parseResult.success) {
    return zodErrorHandler(req, res, parseResult.error);
  }
  return next();
};