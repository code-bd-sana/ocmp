import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';
import { RenewalTracker } from '../../models/training/transportManagerTraining.schema';

/**
 * Transport-manager-training Validation Schemas and Types
 *
 * This module defines Zod schemas for validating transport-manager-training related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single transport-manager-training.
 *
 * → Add all **required** fields here
 */
const zodCreateTransportManagerTrainingSchema = z
  .object({
    name: z
      .string({ message: 'name is required' })
      .min(1, 'name cannot be empty')
      .max(200, 'name cannot exceed 200 characters')
      .trim(),
    trainingCourse: z
      .string({ message: 'trainingCourse is required' })
      .min(1, 'trainingCourse cannot be empty')
      .max(200, 'trainingCourse cannot exceed 200 characters')
      .trim(),
    unitTitle: z
      .string({ message: 'unitTitle is required' })
      .min(1, 'unitTitle cannot be empty')
      .max(200, 'unitTitle cannot exceed 200 characters')
      .trim(),
    completionDate: z.coerce.date({ message: 'completionDate must be a valid date' }),
    renewalTracker: z.nativeEnum(RenewalTracker, {
      message: 'renewalTracker must be one of the valid values',
    }),
    nextDueDate: z.coerce.date({ message: 'nextDueDate must be a valid date' }),
    attachments: z.array(
      z.string().refine(isMongoId, { message: 'attachments must be valid ObjectIds' })
    ),
  })
  .strict();

export type CreateTransportManagerTrainingInput = z.infer<
  typeof zodCreateTransportManagerTrainingSchema
>;

/**
 * Zod schema for validating **bulk creation** (array of transport-manager-training objects).
 */
const zodCreateManyTransportManagerTrainingSchema = z
  .array(zodCreateTransportManagerTrainingSchema)
  .min(1, {
    message: 'At least one transport-manager-training must be provided for bulk creation',
  });

export type CreateManyTransportManagerTrainingInput = z.infer<
  typeof zodCreateManyTransportManagerTrainingSchema
>;

/**
 * Zod schema for validating data when **updating** an existing transport-manager-training.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateTransportManagerTrainingSchema = z
  .object({
    name: z
      .string()
      .min(1, 'name cannot be empty')
      .max(200, 'name cannot exceed 200 characters')
      .trim()
      .optional(),
    trainingCourse: z
      .string()
      .min(1, 'trainingCourse cannot be empty')
      .max(200, 'trainingCourse cannot exceed 200 characters')
      .trim()
      .optional(),
    unitTitle: z
      .string()
      .min(1, 'unitTitle cannot be empty')
      .max(200, 'unitTitle cannot exceed 200 characters')
      .trim()
      .optional(),
    completionDate: z.coerce.date({ message: 'completionDate must be a valid date' }).optional(),
    renewalTracker: z
      .nativeEnum(RenewalTracker, {
        message: 'renewalTracker must be one of the valid values',
      })
      .optional(),
    nextDueDate: z.coerce.date({ message: 'nextDueDate must be a valid date' }).optional(),
    attachments: z
      .array(z.string().refine(isMongoId, { message: 'attachments must be valid ObjectIds' }))
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateTransportManagerTrainingInput = z.infer<
  typeof zodUpdateTransportManagerTrainingSchema
>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateTransportManagerTraining = validateBody(
  zodCreateTransportManagerTrainingSchema
);
export const validateCreateManyTransportManagerTraining = validateBody(
  zodCreateManyTransportManagerTrainingSchema
);
export const validateUpdateTransportManagerTraining = validateBody(
  zodUpdateTransportManagerTrainingSchema
);

