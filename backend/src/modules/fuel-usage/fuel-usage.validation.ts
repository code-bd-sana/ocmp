import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { isMongoId } from 'validator';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Fuel-usage Validation Schemas and Types
 *
 * This module defines Zod schemas for validating fuel-usage related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/** Standalone user: single fuel-usage id param */
const zodFuelUsageIdParamSchema = z
  .object({
    id: z.string({ message: 'fuel-usage id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for fuel-usage id',
    }),
  })
  .strict();
export type FuelUsageIdParamInput = z.infer<typeof zodFuelUsageIdParamSchema>;

/** Transport Manager: fuel-usage id + standAloneId params */
const zodFuelUsageAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'fuel-usage id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for fuel-usage id',
    }),
    standAloneId: z.string({ message: 'standAloneId is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    }),
  })
  .strict();

export type FuelUsageAndManagerIdParamInput = z.infer<typeof zodFuelUsageAndManagerIdParamSchema>;

/**
 * Zod schema for validating data when **creating** a single fuel-usage.
 *
 * → Add all **required** fields here
 */

/** Base fuel usage fields */
const baseFuelUsageFields = {
  vehicleId: z
    .string({ message: 'Vehicle ID is required' })
    .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' }),
  driverId: z
    .string({ message: 'Driver ID is required' })
    .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' }),
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || typeof arg === 'number' || arg instanceof Date) {
        const d = new Date(arg as any);
        return isNaN(d.getTime()) ? arg : d;
      }
      return arg;
    },
    z.date({ message: 'Date is required and must be a valid date' })
  ),
  adBlueUsed: z.number().nonnegative('adBlueUsed must be non-negative').optional(),
  fuelUsed: z.number().nonnegative('fuelUsed must be non-negative').optional(),
};

/** Transport Manager Create: StandAloneId is Required */
const zodCreateFuelUsageAsManagerSchema = z
  .object({
    ...baseFuelUsageFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateFuelUsageAsManagerInput = z.infer<typeof zodCreateFuelUsageAsManagerSchema>;

/** Standalone User Create: StandAloneId is NOT allowed */
const zodCreateFuelUsageAsStandAloneSchema = z
  .object({
    ...baseFuelUsageFields,
  })
  .strict();

export type CreateFuelUsageAsStandAloneInput = z.infer<typeof zodCreateFuelUsageAsStandAloneSchema>;

// Union type for create fuel usage input (either TM or Standalone)
export type CreateFuelUsageInput = CreateFuelUsageAsManagerInput | CreateFuelUsageAsStandAloneInput;

/**
 * Zod schema for validating data when **updating** an existing fuel-usage.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateFuelUsageSchema = z
  .object({
    vehicleId: z
      .string({ message: 'Vehicle ID must be a string' })
      .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' })
      .optional(),
    driverId: z
      .string({ message: 'Driver ID must be a string' })
      .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' })
      .optional(),
    date: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || typeof arg === 'number' || arg instanceof Date) {
          const d = new Date(arg as any);
          return isNaN(d.getTime()) ? arg : d;
        }
        return arg;
      },
      z.date({ message: 'Date must be a valid date' }).optional()
    ),
    adBlueUsed: z.number().nonnegative('adBlueUsed must be non-negative').optional(),
    fuelUsed: z.number().nonnegative('fuelUsed must be non-negative').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateFuelUsageInput = z.infer<typeof zodUpdateFuelUsageSchema>;

/** Extend base search query with standAloneId for Transport Manager filtering */
const zodSearchFuelUsageSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string({ message: 'standAloneId must be a string' })
    .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' })
    .optional(),
});

export type SearchFuelUsageInput = z.infer<typeof zodSearchFuelUsageSchema>;

// Query validator for searching/filtering fuel usage
export const validateSearchFuelUsage = validateQuery(zodSearchFuelUsageSchema);

/**
 * Named validators — use these directly in your Express routes
 */
// Param validators
export const validateFuelUsageIdParam = validateParams(zodFuelUsageIdParamSchema);
export const validateFuelUsageAndManagerIdParam = validateParams(
  zodFuelUsageAndManagerIdParamSchema
);

// Body validators
export const validateCreateFuelUsageAsManager = validateBody(zodCreateFuelUsageAsManagerSchema);
export const validateCreateFuelUsageAsStandAlone = validateBody(
  zodCreateFuelUsageAsStandAloneSchema
);

export const validateUpdateFuelUsage = validateBody(zodUpdateFuelUsageSchema);

