import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Training Validation Schemas and Types
 *
 * Supports both Transport Manager and Standalone User roles.
 * intervalDays is sent as a string (comma/space/backslash/newline separated)
 * and parsed into a number array in the service layer.
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single trainingId param */
const zodTrainingIdParamSchema = z
  .object({
    trainingId: z
      .string({ message: 'Training id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type TrainingIdParamInput = z.infer<typeof zodTrainingIdParamSchema>;

/** TM: trainingId + standAloneId params */
const zodTrainingAndManagerIdParamSchema = z
  .object({
    trainingId: z
      .string({ message: 'Training id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for training ID' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type TrainingAndManagerIdParamInput = z.infer<typeof zodTrainingAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Base training fields (shared between TM and standalone create) */
const baseTrainingFields = {
  trainingName: z
    .string({ message: 'Training name is required' })
    .min(2, 'Training name must be at least 2 characters')
    .max(200, 'Training name is too long')
    .trim(),
  intervalDays: z
    .string({ message: 'Interval days is required (comma/space/backslash/newline separated numbers)' })
    .min(1, 'Interval days cannot be empty'),
};

/** TM create: standAloneId is REQUIRED */
const zodCreateTrainingAsManagerSchema = z
  .object({
    ...baseTrainingFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateTrainingAsManagerInput = z.infer<typeof zodCreateTrainingAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreateTrainingAsStandAloneSchema = z
  .object({
    ...baseTrainingFields,
  })
  .strict();

export type CreateTrainingAsStandAloneInput = z.infer<typeof zodCreateTrainingAsStandAloneSchema>;

// Legacy union type
export type CreateTrainingInput = CreateTrainingAsManagerInput | CreateTrainingAsStandAloneInput;

/** Update training (shared for both roles) */
const zodUpdateTrainingSchema = z
  .object({
    trainingName: z
      .string({ message: 'Training name must be a string' })
      .min(2, 'Training name must be at least 2 characters')
      .max(200, 'Training name is too long')
      .trim()
      .optional(),
    intervalDays: z
      .string({ message: 'Interval days must be a string (comma/space/backslash/newline separated numbers)' })
      .min(1, 'Interval days cannot be empty')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateTrainingInput = z.infer<typeof zodUpdateTrainingSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchTrainingsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchTrainingsQueryInput = z.infer<typeof zodSearchTrainingsSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validateTrainingIdParam = validateParams(zodTrainingIdParamSchema);
export const validateTrainingAndManagerIdParam = validateParams(zodTrainingAndManagerIdParamSchema);

// Body validators
export const validateCreateTrainingAsManager = validateBody(zodCreateTrainingAsManagerSchema);
export const validateCreateTrainingAsStandAlone = validateBody(zodCreateTrainingAsStandAloneSchema);
export const validateUpdateTraining = validateBody(zodUpdateTrainingSchema);

// Search query validators
export const validateSearchTrainingsQueries = validateQuery(zodSearchTrainingsSchema);