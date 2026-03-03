import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import { ToolBoxType } from '../../models/vehicle-transport/trainingToolbox.schema';

/**
 * Training-toolbox Validation Schemas and Types
 *
 * This module defines Zod schemas for validating training-toolbox related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single training-toolbox.
 *
 * → Add all **required** fields here
 */
const baseTrainingToolboxFields = {
  date: z.coerce.date(),
  driverId: z
    .string({ message: 'driverId is required' })
    .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' }),
  toolboxTitle: z
    .string({ message: 'toolboxTitle is required' })
    .min(2, 'toolboxTitle must be at least 2 characters')
    .max(200, 'toolboxTitle is too long')
    .trim(),
  typeOfToolbox: z.nativeEnum(ToolBoxType),
  deliveredBy: z
    .string()
    .refine(isMongoId, { message: 'deliveredBy must be a valid MongoDB ObjectId' })
    .optional(),
  notes: z.string().trim().optional(),
  signed: z.boolean().optional(),
  followUpNeeded: z.boolean().optional(),
  followUpDate: z.coerce.date().optional(),
  signOff: z.boolean().optional(),
  attachments: z
    .array(z.string().refine(isMongoId, { message: 'attachments must be valid ObjectIds' }))
    .optional(),
};

// Create training toolbox as transport manager
const zodCreateTrainingToolboxAsManagerSchema = z
  .object({
    ...baseTrainingToolboxFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

// Create training toolbox as stand-alone user
const zodCreateTrainingToolboxAsStandAloneSchema = z
  .object({
    ...baseTrainingToolboxFields,
  })
  .strict();

const zodCreateTrainingToolboxSchema = zodCreateTrainingToolboxAsStandAloneSchema;

export type CreateTrainingToolboxAsManagerInput = z.infer<
  typeof zodCreateTrainingToolboxAsManagerSchema
>;
export type CreateTrainingToolboxAsStandAloneInput = z.infer<
  typeof zodCreateTrainingToolboxAsStandAloneSchema
>;
export type CreateTrainingToolboxInput =
  | CreateTrainingToolboxAsManagerInput
  | CreateTrainingToolboxAsStandAloneInput;

/**
 * Zod schema for validating data when **updating** an existing training-toolbox.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateTrainingToolboxSchema = z
  .object({
    date: z.coerce.date().optional(),
    driverId: z
      .string()
      .refine(isMongoId, { message: 'driverId must be a valid MongoDB ObjectId' })
      .optional(),
    toolboxTitle: z.string().min(2).max(200).trim().optional(),
    typeOfToolbox: z.nativeEnum(ToolBoxType).optional(),
    deliveredBy: z
      .string()
      .refine(isMongoId, { message: 'deliveredBy must be a valid MongoDB ObjectId' })
      .optional(),
    notes: z.string().trim().optional(),
    signed: z.boolean().optional(),
    followUpNeeded: z.boolean().optional(),
    followUpDate: z.coerce.date().optional(),
    signOff: z.boolean().optional(),
    attachments: z
      .array(z.string().refine(isMongoId, { message: 'attachments must be valid ObjectIds' }))
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateTrainingToolboxInput = z.infer<typeof zodUpdateTrainingToolboxSchema>;

const zodSearchTrainingToolboxSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

const zodTrainingToolboxIdParamSchema = z
  .object({
    id: z.string({ message: 'training-toolbox id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
  })
  .strict();

const zodTrainingToolboxAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'training-toolbox id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for training-toolbox id',
    }),
    standAloneId: z.string({ message: 'standAloneId is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    }),
  })
  .strict();

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateTrainingToolbox = validateBody(zodCreateTrainingToolboxSchema);
export const validateUpdateTrainingToolbox = validateBody(zodUpdateTrainingToolboxSchema);
export const validateCreateTrainingToolboxAsManager = validateBody(
  zodCreateTrainingToolboxAsManagerSchema
);
export const validateCreateTrainingToolboxAsStandAlone = validateBody(
  zodCreateTrainingToolboxAsStandAloneSchema
);
export const validateSearchTrainingToolboxQueries = validateQuery(zodSearchTrainingToolboxSchema);
export const validateTrainingToolboxIdParam = validateParams(zodTrainingToolboxIdParamSchema);
export const validateTrainingToolboxAndManagerIdParam = validateParams(
  zodTrainingToolboxAndManagerIdParamSchema
);

