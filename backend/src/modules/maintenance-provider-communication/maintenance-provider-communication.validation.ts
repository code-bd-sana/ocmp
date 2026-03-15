import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import { CommunicationType } from '../../models/maintenance/maintenance-provider-communication.schema';

/**
 * Maintenance-provider-communication Validation Schemas and Types
 *
 * This module defines Zod schemas for validating maintenance-provider-communication related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

const baseMaintenanceProviderCommunicationFields = {
  providerName: z
    .string()
    .min(2, 'Provider name must be at least 2 characters')
    .max(150, 'Provider name must not exceed 150 characters'),
  type: z.enum(Object.values(CommunicationType) as [string, ...string[]], {
    message: 'Invalid communication type',
  }),
  dateOfCommunication: z.coerce.date({
    message: 'Date of communication must be a valid date string',
  }),
  details: z.string().max(2000, 'Details must not exceed 2000 characters').optional(),
};

/************************************************** */
/****************** CREATE SCHEMAS ******************/
/************************************************** */

/**
 * Zod schema for validating data when **creating** a single maintenance-provider-communication.
 *
 * → Add all **required** fields here
 */
const zodCreateMaintenanceProviderCommunicationAsManagerSchema = z
  .object({
    // Example fields — replace / expand as needed:
    ...baseMaintenanceProviderCommunicationFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateMaintenanceProviderCommunicationAsManagerInput = z.infer<
  typeof zodCreateMaintenanceProviderCommunicationAsManagerSchema
>;

const zodCreateMaintenanceProviderCommunicationAsStandaloneSchema = z
  .object({
    // Example fields — replace / expand as needed:
    ...baseMaintenanceProviderCommunicationFields,
  })
  .strict();

export type CreateMaintenanceProviderCommunicationAsStandaloneInput = z.infer<
  typeof zodCreateMaintenanceProviderCommunicationAsStandaloneSchema
>;

// Legacy type for backward compatibility
export type CreateMaintenanceProviderCommunicationInput =
  | CreateMaintenanceProviderCommunicationAsManagerInput
  | CreateMaintenanceProviderCommunicationAsStandaloneInput;

/****************************************************/
/****************** UPDATE SCHEMAS ******************/
/****************************************************/

/**
 * Zod schema for validating data when **updating** an existing maintenance-provider-communication.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateMaintenanceProviderCommunicationSchema =
  zodCreateMaintenanceProviderCommunicationAsManagerSchema
    .pick({
      providerName: true,
      type: true,
      dateOfCommunication: true,
      details: true,
    })
    .partial()
    .strict();

export type UpdateMaintenanceProviderCommunicationInput = z.infer<
  typeof zodUpdateMaintenanceProviderCommunicationSchema
>;

/****************************************************/
/****************** Filter SCHEMAS ******************/
/****************************************************/

/**
 * Zod schema for validating search query parameters when retrieving multiple compliance-timetables.
 * This can be extended with maintenance provider communication specific search parameters as needed.
 */

const zodMaintenanceProviderCommunicationSearchSchema = zodSearchQuerySchema.extend({
  // You can add maintenance-provider-communication-specific search query parameters here if needed
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});
export type SearchMaintenanceProviderCommunicationQueryInput = z.infer<
  typeof zodMaintenanceProviderCommunicationSearchSchema
>;

/**
 * Zod schema for validating the deletion of a maintenance provider communication, ensuring the provided IDs are valid MongoDB ObjectIds.
 */
const zodMaintenanceProviderCommunicationAndManagerIdSchema = z.object({
  id: z.string().refine(isMongoId, {
    message: 'Please provide a valid MongoDB ObjectId for maintenance provider communication ID',
  }),
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});

export type MaintenanceProviderCommunicationAndManagerIdInput = z.infer<
  typeof zodMaintenanceProviderCommunicationAndManagerIdSchema
>;

/** Standalone user: single id param */
const zodMaintenanceProviderCommunicationIdParamSchema = z
  .object({
    id: z
      .string({ message: 'Maintenance provider communication id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type MaintenanceProviderCommunicationIdParamInput = z.infer<
  typeof zodMaintenanceProviderCommunicationIdParamSchema
>;

const zodGetMaintenanceProviderCommunicationByIdParamsSchema = z
  .object({
    id: z.string({ message: 'Id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for maintenance provider communication ID',
    }),
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
      .optional(),
  })
  .strict();

export type GetMaintenanceProviderCommunicationByIdParamsInput = z.infer<
  typeof zodGetMaintenanceProviderCommunicationByIdParamsSchema
>;

/**
 * Zod schema for validating the deletion of a maintenance provider communication, ensuring the provided IDs are valid MongoDB ObjectIds.
 */

const zodDeleteMaintenanceProviderCommunicationSchema =
  zodMaintenanceProviderCommunicationAndManagerIdSchema.strict();

export type DeleteMaintenanceProviderCommunicationInput = z.infer<
  typeof zodDeleteMaintenanceProviderCommunicationSchema
>;

const zodUpdateMaintenanceProviderCommunicationIdSchema =
  zodMaintenanceProviderCommunicationAndManagerIdSchema.strict();

export type UpdateMaintenanceProviderCommunicationInputWithIds = z.infer<
  typeof zodUpdateMaintenanceProviderCommunicationIdSchema
>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateGetMaintenanceProviderCommunicationByIdParams = validateParams(
  zodGetMaintenanceProviderCommunicationByIdParamsSchema
);
export const validateSearchMaintenanceProviderCommunicationQueries = validateQuery(
  zodMaintenanceProviderCommunicationSearchSchema
);
export const validateCreateMaintenanceProviderCommunicationAsManager = validateBody(
  zodCreateMaintenanceProviderCommunicationAsManagerSchema
);
export const validateCreateMaintenanceProviderCommunicationAsStandalone = validateBody(
  zodCreateMaintenanceProviderCommunicationAsStandaloneSchema
);
export const validateUpdateMaintenanceProviderCommunication = validateBody(
  zodUpdateMaintenanceProviderCommunicationSchema
);
export const validateUpdateMaintenanceProviderCommunicationIds = validateParams(
  zodUpdateMaintenanceProviderCommunicationIdSchema
);
export const validateDeleteMaintenanceProviderCommunication = validateParams(
  zodDeleteMaintenanceProviderCommunicationSchema
);
export const validateDeleteMaintenanceProviderCommunicationIds = validateParams(
  zodDeleteMaintenanceProviderCommunicationSchema
);

