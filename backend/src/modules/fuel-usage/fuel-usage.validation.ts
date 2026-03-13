import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';
import { isMongoId } from 'validator';

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

/** Standalone user: single fuelUsageId param */
const zodFuelUsageIdParamSchema = z
  .object({
    fuelUsageId: z.string().uuid({ message: 'Invalid fuel-usage ID format' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
  })
  .strict();
export type FuelUsageIdParamInput = z.infer<typeof zodFuelUsageIdParamSchema>;

/** Transport Manager: fuelUsageId + standAloneId params */
const zodFuelUsageAndManagerIdParamSchema = z
  .object({
    fuelUsageId: z.string().uuid({ message: 'Invalid fuel-usage ID format' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
    standAloneId: z.string().uuid({ message: 'Invalid standalone ID format' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
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
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateFuelUsageInput = z.infer<typeof zodUpdateFuelUsageSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
// Param validators
export const validateFuelUsageIdParam = validateBody(zodFuelUsageIdParamSchema);
export const validateFuelUsageAndManagerIdParam = validateBody(zodFuelUsageAndManagerIdParamSchema);

// Body validators
export const validateCreateFuelUsageAsManager = validateBody(zodCreateFuelUsageAsManagerSchema);
export const validateCreateFuelUsageAsStandAlone = validateBody(
  zodCreateFuelUsageAsStandAloneSchema
);

export const validateUpdateFuelUsage = validateBody(zodUpdateFuelUsageSchema);

