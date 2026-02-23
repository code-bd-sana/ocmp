import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams } from '../../handlers/zod-error-handler';

/**
 * Training Validation Schemas and Types
 *
 * Defines Zod schemas for creating and updating training records.
 * intervalDays is sent as a string (comma/space/backslash/newline separated)
 * and parsed into a number array in the service layer.
 */

/**
 * Zod schema for validating trainingId in URL params.
 */
const zodTrainingIdParamSchema = z
  .object({
    trainingId: z
      .string({ message: 'Training id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type TrainingIdParamInput = z.infer<typeof zodTrainingIdParamSchema>;

/**
 * Zod schema for creating a new training.
 * Body: { trainingName, intervalDays }
 * intervalDays is a string — values separated by comma, space, backslash, or newline.
 */
const zodCreateTrainingSchema = z
  .object({
    trainingName: z
      .string({ message: 'Training name is required' })
      .min(2, 'Training name must be at least 2 characters')
      .max(200, 'Training name is too long')
      .trim(),
    intervalDays: z
      .string({ message: 'Interval days is required (comma/space/backslash/newline separated numbers)' })
      .min(1, 'Interval days cannot be empty'),
  })
  .strict();

export type CreateTrainingInput = z.infer<typeof zodCreateTrainingSchema>;

/**
 * Zod schema for updating a training.
 * Both fields optional — send only what you want to change.
 */
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

/**
 * Named validators — use these directly in your Express routes
 */
export const validateTrainingIdParam = validateParams(zodTrainingIdParamSchema);
export const validateCreateTraining = validateBody(zodCreateTrainingSchema);
export const validateUpdateTraining = validateBody(zodUpdateTrainingSchema);