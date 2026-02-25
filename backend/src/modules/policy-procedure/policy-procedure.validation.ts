import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Policy Procedure Validation Schemas
 *
 * Supports both Transport Manager and Standalone User roles.
 * Fields: policyName, policyCategory, fileLocations, versionNumber,
 *         effectiveDate, reviewFrequencyMonths, lastReviewDate,
 *         responsiblePerson, notesActionsNeeded, nextReviewDue,
 *         reviewStatus, type
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single policyProcedureId param */
const zodPolicyProcedureIdParamSchema = z
  .object({
    policyProcedureId: z
      .string({ message: 'Policy procedure id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type PolicyProcedureIdParamInput = z.infer<typeof zodPolicyProcedureIdParamSchema>;

/** TM: policyProcedureId + standAloneId params */
const zodPolicyProcedureAndManagerIdParamSchema = z
  .object({
    policyProcedureId: z
      .string({ message: 'Policy procedure id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for policyProcedureId' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type PolicyProcedureAndManagerIdParamInput = z.infer<typeof zodPolicyProcedureAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Base policy procedure fields (shared between TM and standalone create) */
const basePolicyProcedureFields = {
  policyName: z
    .string({ message: 'Policy name is required' })
    .min(1, 'Policy name must be at least 1 character')
    .max(300, 'Policy name must not exceed 300 characters'),
  policyCategory: z
    .string({ message: 'Policy category is required' })
    .min(1, 'Policy category must be at least 1 character')
    .max(200, 'Policy category must not exceed 200 characters'),
  fileLocations: z
    .array(
      z.string({ message: 'Each file location must be a string' }).min(1, 'File location must not be empty'),
      { message: 'File locations must be an array of strings' }
    )
    .min(1, 'At least one file location or link is required'),
  versionNumber: z
    .number({ message: 'Version number is required and must be a number' })
    .nonnegative('Version number must be non-negative'),
  effectiveDate: z
    .string({ message: 'Effective date is required' })
    .datetime({ message: 'Effective date must be a valid ISO date string' }),
  reviewFrequencyMonths: z
    .number({ message: 'Review frequency must be a number' })
    .int('Review frequency must be an integer')
    .positive('Review frequency must be a positive number')
    .optional(),
  lastReviewDate: z
    .string({ message: 'Last review date must be a string' })
    .datetime({ message: 'Last review date must be a valid ISO date string' })
    .optional(),
  responsiblePerson: z
    .string({ message: 'Responsible person is required' })
    .min(1, 'Responsible person must be at least 1 character')
    .max(200, 'Responsible person must not exceed 200 characters'),
  notesActionsNeeded: z
    .string({ message: 'Notes/actions needed must be a string' })
    .max(2000, 'Notes/actions needed must not exceed 2000 characters')
    .optional(),
  nextReviewDue: z
    .string({ message: 'Next review due must be a string' })
    .datetime({ message: 'Next review due must be a valid ISO date string' })
    .optional(),
  reviewStatus: z
    .string({ message: 'Review status is required' })
    .min(1, 'Review status must be at least 1 character')
    .max(100, 'Review status must not exceed 100 characters'),
  type: z
    .string({ message: 'Type is required' })
    .min(1, 'Type must be at least 1 character')
    .max(150, 'Type must not exceed 150 characters'),
};

/** TM create: standAloneId is REQUIRED */
const zodCreatePolicyProcedureAsManagerSchema = z
  .object({
    ...basePolicyProcedureFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreatePolicyProcedureAsManagerInput = z.infer<typeof zodCreatePolicyProcedureAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreatePolicyProcedureAsStandAloneSchema = z
  .object({
    ...basePolicyProcedureFields,
  })
  .strict();

export type CreatePolicyProcedureAsStandAloneInput = z.infer<typeof zodCreatePolicyProcedureAsStandAloneSchema>;

// Legacy union type
export type CreatePolicyProcedureInput = CreatePolicyProcedureAsManagerInput | CreatePolicyProcedureAsStandAloneInput;

/** Update policy procedure (shared for both roles) — all fields optional, at least 1 required */
const zodUpdatePolicyProcedureSchema = z
  .object({
    policyName: z
      .string({ message: 'Policy name must be a string' })
      .min(1, 'Policy name must be at least 1 character')
      .max(300, 'Policy name must not exceed 300 characters')
      .optional(),
    policyCategory: z
      .string({ message: 'Policy category must be a string' })
      .min(1, 'Policy category must be at least 1 character')
      .max(200, 'Policy category must not exceed 200 characters')
      .optional(),
    fileLocations: z
      .array(
        z.string({ message: 'Each file location must be a string' }).min(1, 'File location must not be empty'),
        { message: 'File locations must be an array of strings' }
      )
      .min(1, 'At least one file location or link is required')
      .optional(),
    versionNumber: z
      .number({ message: 'Version number must be a number' })
      .nonnegative('Version number must be non-negative')
      .optional(),
    effectiveDate: z
      .string({ message: 'Effective date must be a string' })
      .datetime({ message: 'Effective date must be a valid ISO date string' })
      .optional(),
    reviewFrequencyMonths: z
      .number({ message: 'Review frequency must be a number' })
      .int('Review frequency must be an integer')
      .positive('Review frequency must be a positive number')
      .optional(),
    lastReviewDate: z
      .string({ message: 'Last review date must be a string' })
      .datetime({ message: 'Last review date must be a valid ISO date string' })
      .optional(),
    responsiblePerson: z
      .string({ message: 'Responsible person must be a string' })
      .min(1, 'Responsible person must be at least 1 character')
      .max(200, 'Responsible person must not exceed 200 characters')
      .optional(),
    notesActionsNeeded: z
      .string({ message: 'Notes/actions needed must be a string' })
      .max(2000, 'Notes/actions needed must not exceed 2000 characters')
      .optional(),
    nextReviewDue: z
      .string({ message: 'Next review due must be a string' })
      .datetime({ message: 'Next review due must be a valid ISO date string' })
      .optional(),
    reviewStatus: z
      .string({ message: 'Review status must be a string' })
      .min(1, 'Review status must be at least 1 character')
      .max(100, 'Review status must not exceed 100 characters')
      .optional(),
    type: z
      .string({ message: 'Type must be a string' })
      .min(1, 'Type must be at least 1 character')
      .max(150, 'Type must not exceed 150 characters')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdatePolicyProcedureInput = z.infer<typeof zodUpdatePolicyProcedureSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchPolicyProceduresSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchPolicyProceduresQueryInput = z.infer<typeof zodSearchPolicyProceduresSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validatePolicyProcedureIdParam = validateParams(zodPolicyProcedureIdParamSchema);
export const validatePolicyProcedureAndManagerIdParam = validateParams(zodPolicyProcedureAndManagerIdParamSchema);

// Body validators
export const validateCreatePolicyProcedureAsManager = validateBody(zodCreatePolicyProcedureAsManagerSchema);
export const validateCreatePolicyProcedureAsStandAlone = validateBody(zodCreatePolicyProcedureAsStandAloneSchema);
export const validateUpdatePolicyProcedure = validateBody(zodUpdatePolicyProcedureSchema);

// Search query validators
export const validateSearchPolicyProceduresQueries = validateQuery(zodSearchPolicyProceduresSchema);