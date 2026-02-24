import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Training Register Validation Schemas and Types
 *
 * Supports both Transport Manager and Standalone User roles.
 * Fields: participantId, trainingId, trainingInterval, trainingDate
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single registerId param */
const zodRegisterIdParamSchema = z
  .object({
    registerId: z
      .string({ message: 'Register id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type RegisterIdParamInput = z.infer<typeof zodRegisterIdParamSchema>;

/** TM: registerId + standAloneId params */
const zodRegisterAndManagerIdParamSchema = z
  .object({
    registerId: z
      .string({ message: 'Register id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for register ID' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type RegisterAndManagerIdParamInput = z.infer<typeof zodRegisterAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Base training register fields (shared between TM and standalone create) */
const baseRegisterFields = {
  participantId: z
    .string({ message: 'Participant ID is required' })
    .refine(isMongoId, { message: 'participantId must be a valid MongoDB ObjectId' }),
  trainingId: z
    .string({ message: 'Training ID is required' })
    .refine(isMongoId, { message: 'trainingId must be a valid MongoDB ObjectId' }),
  trainingInterval: z
    .number({ message: 'Training interval is required and must be a number' })
    .int('Training interval must be an integer')
    .positive('Training interval must be a positive number'),
  trainingDate: z
    .string({ message: 'Training date is required' })
    .datetime({ message: 'Training date must be a valid ISO date string' }),
};

/** TM create: standAloneId is REQUIRED */
const zodCreateRegisterAsManagerSchema = z
  .object({
    ...baseRegisterFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateRegisterAsManagerInput = z.infer<typeof zodCreateRegisterAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreateRegisterAsStandAloneSchema = z
  .object({
    ...baseRegisterFields,
  })
  .strict();

export type CreateRegisterAsStandAloneInput = z.infer<typeof zodCreateRegisterAsStandAloneSchema>;

// Legacy union type
export type CreateRegisterInput = CreateRegisterAsManagerInput | CreateRegisterAsStandAloneInput;

/** Update register (shared for both roles) — all fields optional, at least 1 required */
const zodUpdateRegisterSchema = z
  .object({
    participantId: z
      .string({ message: 'Participant ID must be a string' })
      .refine(isMongoId, { message: 'participantId must be a valid MongoDB ObjectId' })
      .optional(),
    trainingId: z
      .string({ message: 'Training ID must be a string' })
      .refine(isMongoId, { message: 'trainingId must be a valid MongoDB ObjectId' })
      .optional(),
    trainingInterval: z
      .number({ message: 'Training interval must be a number' })
      .int('Training interval must be an integer')
      .positive('Training interval must be a positive number')
      .optional(),
    trainingDate: z
      .string({ message: 'Training date must be a string' })
      .datetime({ message: 'Training date must be a valid ISO date string' })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateRegisterInput = z.infer<typeof zodUpdateRegisterSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchRegistersSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchRegistersQueryInput = z.infer<typeof zodSearchRegistersSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validateRegisterIdParam = validateParams(zodRegisterIdParamSchema);
export const validateRegisterAndManagerIdParam = validateParams(zodRegisterAndManagerIdParamSchema);

// Body validators
export const validateCreateRegisterAsManager = validateBody(zodCreateRegisterAsManagerSchema);
export const validateCreateRegisterAsStandAlone = validateBody(zodCreateRegisterAsStandAloneSchema);
export const validateUpdateRegister = validateBody(zodUpdateRegisterSchema);

// Search query validators
export const validateSearchRegistersQueries = validateQuery(zodSearchRegistersSchema);