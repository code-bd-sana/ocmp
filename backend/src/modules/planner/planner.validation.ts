import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import e from 'express';

/**
 * Planner Validation Schemas and Types
 *
 * This module defines Zod schemas for validating planner related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single planner.
 */
// base fields for creation
const basePlannerFields = {
  vehicleId: z.string({ message: 'Vehicle ID is required' }).refine(isMongoId, {
    message: 'Vehicle ID must be a valid MongoDB ObjectId',
  }),
  plannerType: z.enum(
    ['INSPECTIONS', 'MOT', 'BRAKE_TEST', 'SERVICE', 'REPAIR', 'TACHO_RECALIBRATION', 'VED'],
    {
      message: 'Planner type must be one of the predefined values',
    }
  ),
  plannerDate: z.string({ message: 'Planner date is required' }).refine(
    (date) => {
      return !isNaN(Date.parse(date));
    },
    { message: 'Planner date must be a valid date string' }
  ),
  requestedDate: z
    .string()
    .refine(
      (date) => {
        return !isNaN(Date.parse(date));
      },
      { message: 'Requested date must be a valid date string' }
    )
    .optional(),
  requestedReason: z
    .string()
    .max(1000, 'Requested reason must be at most 1000 characters')
    .optional(),
  missedReason: z.string().max(1000, 'Missed reason must be at most 1000 characters').optional(),
};

// Transport Manager created: standAloneId is REQUIRED
const zodCreatePlannerAsManagerSchema = z
  .object({
    ...basePlannerFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreatePlannerAsManagerInput = z.infer<typeof zodCreatePlannerAsManagerSchema>;

// Standalone created: no standAloneId
const zodCreatePlannerAsStandAloneSchema = z.object({ ...basePlannerFields }).strict();

export type CreatePlannerAsStandAloneInput = z.infer<typeof zodCreatePlannerAsStandAloneSchema>;

export type CreatePlannerInput = CreatePlannerAsStandAloneInput | CreatePlannerAsManagerInput;

/**
 * Zod schema for bulk creating multiple planners with multiple specific dates
 */
// base fields for bulk creation with multiple dates
const baseBulkPlannerFields = {
  vehicleId: z.string({ message: 'Vehicle ID is required' }).refine(isMongoId, {
    message: 'Vehicle ID must be a valid MongoDB ObjectId',
  }),
  plannerType: z.enum(
    ['INSPECTIONS', 'MOT', 'BRAKE_TEST', 'SERVICE', 'REPAIR', 'TACHO_RECALIBRATION', 'VED'],
    {
      message: 'Planner type must be one of the predefined values',
    }
  ),
  dates: z
    .array(
      z.string().refine(
        (date) => {
          return !isNaN(Date.parse(date));
        },
        { message: 'Each date must be a valid date string' }
      ),
      { message: 'Dates array is required' }
    )
    .min(1, 'At least one date is required'),
};

// Transport Manager bulk create: standAloneId is REQUIRED
const zodBulkCreatePlannerAsManagerSchema = z
  .object({
    ...baseBulkPlannerFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type BulkCreatePlannerAsManagerInput = z.infer<typeof zodBulkCreatePlannerAsManagerSchema>;

// Standalone bulk create: no standAloneId
const zodBulkCreatePlannerAsStandAloneSchema = z.object({ ...baseBulkPlannerFields }).strict();

export type BulkCreatePlannerAsStandAloneInput = z.infer<
  typeof zodBulkCreatePlannerAsStandAloneSchema
>;

export type BulkCreatePlannerInput =
  | BulkCreatePlannerAsStandAloneInput
  | BulkCreatePlannerAsManagerInput;

/**
 * Zod schema for validating data when **updating** an existing planner.
 */

// base fields for update (all optional)
// const baseUpdatePlannerFields = {
//   plannerDate: z
//     .string()
//     .refine(
//       (date) => {
//         return !isNaN(Date.parse(date));
//       },
//       { message: 'Planner date must be a valid date string' }
//     )
//     .optional(),
//   requestedDate: z
//     .string()
//     .refine(
//       (date) => {
//         return !isNaN(Date.parse(date));
//       },
//       { message: 'Requested date must be a valid date string' }
//     )
//     .optional(),
//   requestedReason: z
//     .string()
//     .max(1000, 'Requested reason must be at most 1000 characters')
//     .optional(),
//   missedReason: z.string().max(1000, 'Missed reason must be at most 1000 characters').optional(),
// };

// 2 different update schemas for Transport Manager (standAloneId required) and Standalone User (no standAloneId)

// for Transport Manager updating a planner (standAloneId required)
const zodUpdatePlannerAsManagerSchema = z
  .object({
    plannerDate: z.string().refine(
      (date) => {
        return !isNaN(Date.parse(date));
      },
      { message: 'Planner date must be a valid date string' }
    ),
  })
  .strict();

export type UpdatePlannerAsManagerInput = z.infer<typeof zodUpdatePlannerAsManagerSchema>;

const zodRequestChangePlannerDateSchema = z
  .object({
    requestedDate: z.string().refine(
      (date) => {
        return !isNaN(Date.parse(date));
      },
      { message: 'Requested date must be a valid date string' }
    ),
    requestedReason: z.string().max(1000, 'Requested reason must be at most 1000 characters'),
  })
  .strict();

export type RequestChangePlannerDateInput = z.infer<typeof zodRequestChangePlannerDateSchema>;

// for validating search query parameters when retrieving multiple planners
const zodSearchPlannerSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' })
    .optional(),
});

export type SearchPlannerQueryInput = z.infer<typeof zodSearchPlannerSchema>;

// for validating the :id param in routes like GET /planner/:id, PUT /planner/:id, DELETE /planner/:id
const zodPlannerIdParamSchema = z
  .object({
    id: z.string({ message: 'Planner id is required' }).refine(isMongoId, {
      message: 'Planner id must be a valid MongoDB ObjectId',
    }),
  })
  .strict();

export type PlannerIdParamInput = z.infer<typeof zodPlannerIdParamSchema>;

// for validating the :id and :standAloneId params in routes like GET /planner/:id/:standAloneId, PUT /planner/:id/:standAloneId, DELETE /planner/:id/:standAloneId
const zodPlannerAndManagerIdParamSchema = z
  .object({
    id: z.string({ message: 'Planner id is required' }).refine(isMongoId, {
      message: 'Planner id must be a valid MongoDB ObjectId',
    }),
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type PlannerAndManagerIdParamInput = z.infer<typeof zodPlannerAndManagerIdParamSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreatePlannerAsManager = validateBody(zodCreatePlannerAsManagerSchema);
export const validateCreatePlannerAsStandAlone = validateBody(zodCreatePlannerAsStandAloneSchema);
export const validateBulkCreatePlannerAsManager = validateBody(zodBulkCreatePlannerAsManagerSchema);
export const validateBulkCreatePlannerAsStandAlone = validateBody(
  zodBulkCreatePlannerAsStandAloneSchema
);
export const validateUpdatePlannerAsManager = validateBody(zodUpdatePlannerAsManagerSchema);
export const validateUpdatePlannerAsStandAlone = validateBody(zodUpdatePlannerAsManagerSchema);
// export const validateUpdatePlannerAsStandAlone = validateBody(zodUpdatePlannerAsStandAloneSchema);
export const validateSearchPlannerQueries = validateQuery(zodSearchPlannerSchema);
export const validateIdParam = validateParams(zodPlannerIdParamSchema);
export const validateIdAndManagerParam = validateParams(zodPlannerAndManagerIdParamSchema);
export const validationRequestChangePlannerDate = validateBody(zodRequestChangePlannerDateSchema);
export const validateRequestChangePlannerPrams = validateParams(
  zodPlannerAndManagerIdParamSchema.pick({ standAloneId: true })
);
