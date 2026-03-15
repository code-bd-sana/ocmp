import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Contact-log Validation Schemas and Types
 *
 * This module defines Zod schemas for validating contact-log related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */
const baseContactLogFields = {
  date: z.coerce.date({ message: 'Contact date must be a valid date string' }),
  contactMethod: z.string().optional(),
  person: z.string().max(250, 'Person must not exceed 250 characters'),
  subject: z.string().max(250, 'Subject must not exceed 250 characters').optional(),
  outcome: z.string().max(250, 'Outcome must not exceed 250 characters').optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.coerce.date({ message: 'Follow-up date must be a valid date string' }).optional(),
};

/**
 * Zod schema for validating data when **creating** a single contact-log.
 *
 * → Add all **required** fields here
 */
const zodCreateContactLogAsManagerSchema = z
  .object({
    // Example fields — replace / expand as needed:
    ...baseContactLogFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();
export type CreateContactLogInputAsManager = z.infer<typeof zodCreateContactLogAsManagerSchema>;

/*
 * Zod schema for validating data when **creating** a single contact-log.
 * → Add all **required** fields here
 */
const zodCreateContactLogAsStandaloneSchema = z
  .object({
    // Example fields — replace / expand as needed:
    ...baseContactLogFields,
  })
  .strict();
export type CreateContactLogInputAsStandalone = z.infer<
  typeof zodCreateContactLogAsStandaloneSchema
>;

// Legacy type for backward compatibility
export type CreateContactLogInput =
  | CreateContactLogInputAsManager
  | CreateContactLogInputAsStandalone;

/**
 * Zod schema for validating data when **updating** an existing contact-log.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateContactLogSchema = zodCreateContactLogAsManagerSchema
  .pick({
    date: true,
    contactMethod: true,
    person: true,
    subject: true,
    outcome: true,
    followUpRequired: true,
    followUpDate: true,
  })
  .refine(
    (data) => {
      // Ensure at least one field is provided for update
      return Object.keys(data).length > 0;
    },
    { message: 'At least one field must be provided for update' }
  )
  .strict();

export type UpdateContactLogInput = z.infer<typeof zodUpdateContactLogSchema>;

/**
 * Zod schema for validating search query parameters when fetching contact-logs.
 * Extend the base search query schema with any contact-log specific parameters if needed.
 */
const zodContactLogSearchSchema = zodSearchQuerySchema.extend({
  // You can add meeting-note-specific search query parameters here if needed
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});
export type SearchContactLogQueryInput = z.infer<typeof zodContactLogSearchSchema>;

/**
 * Zod schema for validating both contact log ID and standAloneId together (e.g., for update or delete operations).
 * This ensures that both IDs are present and valid when required.
 * This can be used in routes that require both the contact log ID and the standAloneId for authorization or other purposes.
 **/
const zodContactLogAndManagerIdSchema = z.object({
  id: z.string().refine(isMongoId, {
    message: 'Please provide a valid MongoDB ObjectId for contact log ID',
  }),
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});
export type ContactLogAndManagerIdInput = z.infer<typeof zodContactLogAndManagerIdSchema>;

/**
 * Zod schema for validating contact log ID as a route parameter.
 * This is useful for routes that only require the contact log ID (e.g., fetching a single contact log by ID).
 */
const zodContactLogIdParamSchema = z
  .object({
    id: z
      .string({ message: 'Contact log id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type ContactLogIdParamInput = z.infer<typeof zodContactLogIdParamSchema>;

/**
 * Zod schema for validating the combination of contact log ID and standAloneId when fetching a contact log by ID.
 * This ensures that both IDs are valid and can be used for authorization or other purposes when fetching a specific contact log.
 */
const zodGetContactLogByIdParamsSchema = z
  .object({
    id: z.string({ message: 'Id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for contact log ID',
    }),
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
      .optional(),
  })
  .strict();

export type GetContactLogByIdParamsInput = z.infer<typeof zodGetContactLogByIdParamsSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateGetContactLogByIdParams = validateParams(zodGetContactLogByIdParamsSchema);
export const validateSearchContactLogQueries = validateQuery(zodContactLogSearchSchema);
export const validateCreateContactLogAsManager = validateBody(zodCreateContactLogAsManagerSchema);
export const validateCreateContactLogAsStandalone = validateBody(
  zodCreateContactLogAsStandaloneSchema
);
export const validateUpdateContactLog = validateBody(zodUpdateContactLogSchema);
export const validateUpdateContactLogIds = validateBody(zodContactLogAndManagerIdSchema);
export const validateDeleteContactLogIds = validateParams(zodContactLogAndManagerIdSchema);

