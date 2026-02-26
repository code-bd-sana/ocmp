import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Ocrs-plan Validation Schemas and Types
 *
 * This module defines Zod schemas for validating ocrs-plan related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single ocrs-plan.
 *
 * → Add all **required** fields here
 */
const zodDocumentItemSchema = z
  .object({
    textDoc: z
      .array(
        z.object({
          label: z.string().trim().min(1, 'label is required'),
          description: z.string().trim().optional().default(''),
        })
      )
      .optional(),
    attachments: z
      .array(z.string().refine(isMongoId, { message: 'attachments must be valid ObjectIds' }))
      .optional(),
  })
  .strict();

const baseOcrsPlanFields = {
  roadWorthinessScore: z.string().trim().optional(),
  overallTrafficScore: z.string().trim().optional(),
  actionRequired: z.string().trim().optional(),
  documents: z.array(zodDocumentItemSchema).optional(),
  createdBy: z
    .string()
    .refine(isMongoId, { message: 'createdBy must be a valid MongoDB ObjectId' })
    .optional(),
};

const zodCreateOcrsPlanAsManagerSchema = z
  .object({
    ...baseOcrsPlanFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

const zodCreateOcrsPlanAsStandAloneSchema = z
  .object({
    ...baseOcrsPlanFields,
  })
  .strict();

const zodCreateOcrsPlanSchema = zodCreateOcrsPlanAsStandAloneSchema;

export type CreateOcrsPlanAsManagerInput = z.infer<typeof zodCreateOcrsPlanAsManagerSchema>;
export type CreateOcrsPlanAsStandAloneInput = z.infer<typeof zodCreateOcrsPlanAsStandAloneSchema>;
export type CreateOcrsPlanInput = CreateOcrsPlanAsManagerInput | CreateOcrsPlanAsStandAloneInput;

/**
 * Zod schema for validating data when **updating** an existing ocrs-plan.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateOcrsPlanSchema = z
  .object({
    roadWorthinessScore: z.string().trim().optional(),
    overallTrafficScore: z.string().trim().optional(),
    actionRequired: z.string().trim().optional(),
    documents: z.array(zodDocumentItemSchema).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateOcrsPlanInput = z.infer<typeof zodUpdateOcrsPlanSchema>;

const zodSearchOcrsPlanSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

const zodOcrsPlanIdParamSchema = z
  .object({
    id: z.string({ message: 'ocrs-plan id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId',
    }),
  })
  .strict();

const zodOcrsPlanAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'ocrs-plan id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for ocrs-plan id',
    }),
    standAloneId: z.string({ message: 'standAloneId is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for standAloneId',
    }),
  })
  .strict();

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateOcrsPlan = validateBody(zodCreateOcrsPlanSchema);
export const validateUpdateOcrsPlan = validateBody(zodUpdateOcrsPlanSchema);
export const validateCreateOcrsPlanAsManager = validateBody(zodCreateOcrsPlanAsManagerSchema);
export const validateCreateOcrsPlanAsStandAlone = validateBody(zodCreateOcrsPlanAsStandAloneSchema);
export const validateSearchOcrsPlanQueries = validateQuery(zodSearchOcrsPlanSchema);
export const validateOcrsPlanIdParam = validateParams(zodOcrsPlanIdParamSchema);
export const validateOcrsPlanAndManagerIdParam = validateParams(zodOcrsPlanAndManagerIdParamSchema);
