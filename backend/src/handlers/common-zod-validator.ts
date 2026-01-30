import { isMongoId } from 'validator';
import { z } from 'zod';
import { validate } from './zod-error-handler';

/**
 * ID Validation Schemas and Types
 *
 * This module defines Zod schemas for validating MongoDB ObjectIds
 * (single id or array of ids) as well as common search query parameters.
 * It also exports corresponding TypeScript types and named validator
 * middleware functions for use in Express routes.
 */

/**
 * Zod schema for validating single id or array of ids.
 */
const zodIdSchema = z
  .object({
    id: z
      .string({ message: 'Id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' })
      .optional(),

    ids: z
      .array(
        z.string().refine(isMongoId, {
          message: 'Each ID must be a valid MongoDB ObjectId',
        })
      )
      .min(1, { message: 'At least one ID must be provided' })
      .optional(),
  })
  .strict();

/**
 * Zod schema for validating pagination & search query parameters.
 */
const zodSearchQuerySchema = z
  .object({
    searchKey: z.string({ message: 'Please specify the search key' }).optional(),

    showPerPage: z
      .string()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val): val is number => val !== undefined && val > 0, {
        message: 'Show per page must be a positive number',
      })
      .optional(),

    pageNo: z
      .string()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val): val is number => val !== undefined && val > 0, {
        message: 'Page number must be a positive number',
      })
      .optional(),
  })
  .strict();

/**
 * Named validators (to be used in Express routes)
 */
export const validateId = validate(zodIdSchema.pick({ id: true }));
export const validateIds = validate(zodIdSchema.pick({ ids: true }));
export const validateSearchQueries = validate(zodSearchQuerySchema);
