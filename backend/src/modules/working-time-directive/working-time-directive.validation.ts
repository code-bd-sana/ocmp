import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Working Time Directive Validation Schemas
 *
 * Supports both Transport Manager and Standalone User roles.
 * Fields: driverId, vehicleId, workingHours, restHours (optional),
 *         complianceStatus (optional), tachoReportAvailable (optional)
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single workingTimeDirectiveId param */
const zodWorkingTimeDirectiveIdParamSchema = z
  .object({
    workingTimeDirectiveId: z
      .string({ message: 'Working time directive id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type WorkingTimeDirectiveIdParamInput = z.infer<typeof zodWorkingTimeDirectiveIdParamSchema>;

/** TM: workingTimeDirectiveId + standAloneId params */
const zodWorkingTimeDirectiveAndManagerIdParamSchema = z
  .object({
    workingTimeDirectiveId: z
      .string({ message: 'Working time directive id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for workingTimeDirectiveId' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type WorkingTimeDirectiveAndManagerIdParamInput = z.infer<typeof zodWorkingTimeDirectiveAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Base working time directive fields (shared between TM and standalone create) */
const baseWorkingTimeDirectiveFields = {
  driverId: z
    .string({ message: 'Driver id is required' })
    .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' }),
  vehicleId: z
    .string({ message: 'Vehicle id is required' })
    .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' }),
  workingHours: z
    .number({ message: 'Working hours is required and must be a number' })
    .nonnegative('Working hours must be non-negative'),
  restHours: z
    .number({ message: 'Rest hours must be a number' })
    .nonnegative('Rest hours must be non-negative')
    .optional(),
  complianceStatus: z
    .string({ message: 'Compliance status must be a string' })
    .max(200, 'Compliance status must not exceed 200 characters')
    .optional(),
  tachoReportAvailable: z
    .boolean({ message: 'Tacho report available must be a boolean' })
    .optional(),
};

/** TM create: standAloneId is REQUIRED */
const zodCreateWorkingTimeDirectiveAsManagerSchema = z
  .object({
    ...baseWorkingTimeDirectiveFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateWorkingTimeDirectiveAsManagerInput = z.infer<typeof zodCreateWorkingTimeDirectiveAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreateWorkingTimeDirectiveAsStandAloneSchema = z
  .object({
    ...baseWorkingTimeDirectiveFields,
  })
  .strict();

export type CreateWorkingTimeDirectiveAsStandAloneInput = z.infer<typeof zodCreateWorkingTimeDirectiveAsStandAloneSchema>;

// Legacy union type
export type CreateWorkingTimeDirectiveInput = CreateWorkingTimeDirectiveAsManagerInput | CreateWorkingTimeDirectiveAsStandAloneInput;

/** Update working time directive (shared for both roles) — all fields optional, at least 1 required */
const zodUpdateWorkingTimeDirectiveSchema = z
  .object({
    driverId: z
      .string({ message: 'Driver id must be a string' })
      .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' })
      .optional(),
    vehicleId: z
      .string({ message: 'Vehicle id must be a string' })
      .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' })
      .optional(),
    workingHours: z
      .number({ message: 'Working hours must be a number' })
      .nonnegative('Working hours must be non-negative')
      .optional(),
    restHours: z
      .number({ message: 'Rest hours must be a number' })
      .nonnegative('Rest hours must be non-negative')
      .optional(),
    complianceStatus: z
      .string({ message: 'Compliance status must be a string' })
      .max(200, 'Compliance status must not exceed 200 characters')
      .optional(),
    tachoReportAvailable: z
      .boolean({ message: 'Tacho report available must be a boolean' })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateWorkingTimeDirectiveInput = z.infer<typeof zodUpdateWorkingTimeDirectiveSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchWorkingTimeDirectivesSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchWorkingTimeDirectivesQueryInput = z.infer<typeof zodSearchWorkingTimeDirectivesSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validateWorkingTimeDirectiveIdParam = validateParams(zodWorkingTimeDirectiveIdParamSchema);
export const validateWorkingTimeDirectiveAndManagerIdParam = validateParams(zodWorkingTimeDirectiveAndManagerIdParamSchema);

// Body validators
export const validateCreateWorkingTimeDirectiveAsManager = validateBody(zodCreateWorkingTimeDirectiveAsManagerSchema);
export const validateCreateWorkingTimeDirectiveAsStandAlone = validateBody(zodCreateWorkingTimeDirectiveAsStandAloneSchema);
export const validateUpdateWorkingTimeDirective = validateBody(zodUpdateWorkingTimeDirectiveSchema);

// Search query validators
export const validateSearchWorkingTimeDirectivesQueries = validateQuery(zodSearchWorkingTimeDirectivesSchema);
