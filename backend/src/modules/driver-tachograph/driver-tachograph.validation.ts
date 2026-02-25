import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Driver-tachograph Validation Schemas and Types
 *
 * This module defines Zod schemas for validating driver-tachograph related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single driver-tachograph.
 *
 * → Add all **required** fields here
 */
const baseDriverTachographFields = {
  vehicleId: z
    .string({ message: 'vehicleId is required' })
    .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' }),
  driverId: z
    .string({ message: 'driverId is required' })
    .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' }),
  typeOfInfringement: z.string().trim().optional(),
  details: z.string().trim().optional(),
  actionTaken: z.string().trim().optional(),
  reviewedBy: z
    .string()
    .refine(isMongoId, { message: 'reviewedBy must be a valid MongoDB ObjectId' })
    .optional(),
  Signed: z.boolean().optional(),
};

const zodCreateDriverTachographAsManagerSchema = z
  .object({
    ...baseDriverTachographFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

const zodCreateDriverTachographAsStandAloneSchema = z
  .object({
    ...baseDriverTachographFields,
  })
  .strict();

const zodCreateDriverTachographSchema = zodCreateDriverTachographAsStandAloneSchema;

export type CreateDriverTachographAsManagerInput = z.infer<
  typeof zodCreateDriverTachographAsManagerSchema
>;
export type CreateDriverTachographAsStandAloneInput = z.infer<
  typeof zodCreateDriverTachographAsStandAloneSchema
>;

export type CreateDriverTachographInput =
  | CreateDriverTachographAsManagerInput
  | CreateDriverTachographAsStandAloneInput;

/**
 * Zod schema for validating **bulk creation** (array of driver-tachograph objects).
 */
const zodCreateManyDriverTachographSchema = z
  .array(zodCreateDriverTachographSchema)
  .min(1, { message: 'At least one driver-tachograph must be provided for bulk creation' });

export type CreateManyDriverTachographInput = z.infer<typeof zodCreateManyDriverTachographSchema>;

/**
 * Zod schema for validating data when **updating** an existing driver-tachograph.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateDriverTachographSchema = z
  .object({
    driverId: z
      .string()
      .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' })
      .optional(),
    vehicleId: z
      .string()
      .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' })
      .optional(),
    typeOfInfringement: z.string().trim().optional(),
    details: z.string().trim().optional(),
    actionTaken: z.string().trim().optional(),
    reviewedBy: z
      .string()
      .refine(isMongoId, { message: 'reviewedBy must be a valid MongoDB ObjectId' })
      .optional(),
    Signed: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateDriverTachographInput = z.infer<typeof zodUpdateDriverTachographSchema>;

/**
 * Zod schema for validating bulk updates (array of partial driver-tachograph objects).
 */
const zodUpdateManyDriverTachographForBulkSchema = zodUpdateDriverTachographSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple driver-tachograph updates.
 */
const zodUpdateManyDriverTachographSchema = z
  .array(zodUpdateManyDriverTachographForBulkSchema)
  .min(1, { message: 'At least one driver-tachograph update object must be provided' });

export type UpdateManyDriverTachographInput = z.infer<typeof zodUpdateManyDriverTachographSchema>;

const zodUpdateDriverTachographReviewedBySchema = z
  .object({
    reviewedBy: z
      .string({ message: 'reviewedBy is required' })
      .refine(isMongoId, { message: 'reviewedBy must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type UpdateDriverTachographReviewedByInput = z.infer<
  typeof zodUpdateDriverTachographReviewedBySchema
>;

const zodSearchDriverTachographSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

const zodDriverTachographIdParamSchema = z
  .object({
    id: z.string({ message: 'driver-tachograph id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
  })
  .strict();

const zodDriverTachographAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'driver-tachograph id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for driver-tachograph id',
    }),
    standAloneId: z.string({ message: 'standAloneId is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    }),
  })
  .strict();

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateDriverTachograph = validateBody(zodCreateDriverTachographSchema);
export const validateCreateManyDriverTachograph = validateBody(zodCreateManyDriverTachographSchema);
export const validateUpdateDriverTachograph = validateBody(zodUpdateDriverTachographSchema);
export const validateUpdateManyDriverTachograph = validateBody(zodUpdateManyDriverTachographSchema);
export const validateUpdateDriverTachographReviewedBy = validateBody(
  zodUpdateDriverTachographReviewedBySchema
);
export const validateCreateDriverTachographAsManager = validateBody(
  zodCreateDriverTachographAsManagerSchema
);
export const validateCreateDriverTachographAsStandAlone = validateBody(
  zodCreateDriverTachographAsStandAloneSchema
);
export const validateSearchDriverTachographQueries = validateQuery(zodSearchDriverTachographSchema);
export const validateDriverTachographIdParam = validateParams(zodDriverTachographIdParamSchema);
export const validateDriverTachographAndManagerIdParam = validateParams(
  zodDriverTachographAndManagerIdParamSchema
);

