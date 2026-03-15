import { NextFunction, Request, RequestHandler, Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';

/**
 * A utility function to handle asynchronous route handlers and middleware.
 *
 * This function wraps asynchronous route handlers or middleware and catches any
 * errors that are thrown or returned as rejected promises. It forwards these errors
 * to the next middleware in the stack using `next()`, ensuring proper error handling
 * in Express applications.
 *
 * @param {RequestHandler} fn - The asynchronous route handler or middleware function to be wrapped.
 * @returns {RequestHandler} A new function that wraps the provided asynchronous handler or middleware.
 */
const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Wrap the handler function in a promise to catch any errors
    Promise.resolve(fn(req, res, next)).catch((err) => {
      // Log the error for debugging purposes (optional)
      console.error('Async error:', err);

      const statusCode =
        typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode <= 599
          ? err.statusCode
          : 500;

      const message =
        typeof err?.message === 'string' && err.message.trim().length
          ? err.message
          : 'An unexpected error occurred';

      // For non-500 responses we keep the message clean and avoid duplicating an error field.
      // For 500 responses we still include low-level details in `error` for debugging.
      const errorDetails = statusCode === 500 ? err?.message : undefined;

      ServerResponse(res, false, statusCode, message, null, null, errorDetails);
    });
  };
};

export default catchAsync;
