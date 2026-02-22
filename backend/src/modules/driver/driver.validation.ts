import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { CheckStatus } from '../../models';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import { createDriverAsTransportManager } from './driver.controller';

/**
 * Driver Validation Schemas and Types
 *
 * This module defines Zod schemas for validating driver related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Base Zod schema for common driver fields
 */
const baseDriverFields = {
  fullName: z
    .string({ message: 'Full name must be a string' })
    .min(2, 'Full name must be at least 2 characters')
    .max(120, 'Full name must not exceed 120 characters'),
  licenseNumber: z
    .string({ message: 'License number must be a string' })
    .min(2, 'License number is required')
    .max(80, 'License number must not exceed 80 characters'),
  postCode: z
    .string({ message: 'Post code must be a string' })
    .min(2, 'Post code is required')
    .max(20, 'Post code must not exceed 20 characters'),
  niNumber: z
    .string({ message: 'NI number must be a string' })
    .min(2, 'NI number is required')
    .max(30, 'NI number must not exceed 30 characters'),
  nextCheckDueDate: z.coerce.date({ message: 'Next check due date is required' }),
  licenseExpiry: z.coerce
    .date({ message: 'License expiry must be a valid date string' })
    .optional(),
  licenseExpiryDTC: z.coerce
    .date({ message: 'License expiry DTC must be a valid date string' })
    .optional(),
  cpcExpiry: z.coerce.date({ message: 'CPC expiry must be a valid date string' }).optional(),
  points: z
    .number({ message: 'Points must be a number' })
    .int({ message: 'Points must be an integer' })
    .min(0, 'Points cannot be negative'),
  endorsementCodes: z.array(z.string({ message: 'Endorsement code must be a string' })).optional(),
  lastChecked: z.coerce.date({ message: 'Last checked must be a valid date string' }).optional(),
  checkFrequencyDays: z
    .number({ message: 'Check frequency days must be a number' })
    .int({ message: 'Check frequency days must be an integer' })
    .min(0, 'Check frequency days cannot be negative'),
  employed: z.boolean({ message: 'Employed must be a boolean value' }),
  checkStatus: z.nativeEnum(CheckStatus).optional(),
  attachments: z
    .array(z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }))
    .optional(),
};

/**
 * Zod schema for creating a driver as a Transport Manager
 * → standAloneId is REQUIRED (must be one of the manager's approved clients)
 */
const zodCreateDriverAsTransportManagerSchema = z
  .object({
    ...baseDriverFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateDriverAsTransportManagerInput = z.infer<
  typeof zodCreateDriverAsTransportManagerSchema
>;

/**
 * Zod schema for creating a driver as a Stand-Alone user
 * → standAloneId is optional (stand-alone users employ their own drivers)
 */
const zodCreateDriverAsStandAloneSchema = z
  .object({
    ...baseDriverFields,
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' })
      .optional(),
  })
  .strict();

export type CreateDriverAsStandAloneInput = z.infer<typeof zodCreateDriverAsStandAloneSchema>;

// Legacy type for backward compatibility
export type CreateDriverInput = CreateDriverAsTransportManagerInput | CreateDriverAsStandAloneInput;

/**
 * Zod schema for validating data when **updating** an existing driver.
 *
 * → All fields should usually be .optional()
 */
// Build an update schema by picking allowed fields from the create schema
// then making them optional with .partial()
const zodUpdateDriverSchema = zodCreateDriverAsTransportManagerSchema
  .pick({
    fullName: true,
    licenseNumber: true,
    postCode: true,
    niNumber: true,
    nextCheckDueDate: true,
    licenseExpiry: true,
    licenseExpiryDTC: true,
    cpcExpiry: true,
    points: true,
    endorsementCodes: true,
    lastChecked: true,
    checkFrequencyDays: true,
    employed: true,
    checkStatus: true,
    attachments: true,
  })
  .partial();

export type UpdateDriverInput = z.infer<typeof zodUpdateDriverSchema>;

/**
 * Zod schema for validating search query parameters when retrieving multiple drivers.
 * This can be extended with driver-specific search parameters as needed.
 */

const zodSearchDriverSchema = zodSearchQuerySchema.extend({
  // You can add driver-specific search query parameters here if needed

  // get client's id
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});

export type SearchDriverQueryInput = z.infer<typeof zodSearchDriverSchema>;

/**
 * Zod schema for validating the deletion of a driver, ensuring the provided IDs are valid MongoDB ObjectIds.
 */

const zodDriverAndManagerIdSchema = z.object({
  driverId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for driver ID' }),
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});

export type DriverAndManagerIdInput = z.infer<typeof zodDriverAndManagerIdSchema>;

/**
 * Zod schema for validating the deletion of a driver, ensuring the provided IDs are valid MongoDB ObjectIds.
 */

const zodDeleteDriverSchema = zodDriverAndManagerIdSchema.strict();

export type DeleteDriverInput = z.infer<typeof zodDeleteDriverSchema>;

const zodUpdateDriverIdSchema = zodDriverAndManagerIdSchema.strict();

export type UpdateDriverInputWithIds = z.infer<typeof zodUpdateDriverIdSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateDriverAsTransportManager = validateBody(
  zodCreateDriverAsTransportManagerSchema
);
export const validateCreateDriverAsStandAlone = validateBody(zodCreateDriverAsStandAloneSchema);
export const validateUpdateDriver = validateBody(zodUpdateDriverSchema);
export const validateSearchDriverQueries = validateQuery(zodSearchDriverSchema);
export const validateDeleteDriverIds = validateParams(zodDeleteDriverSchema);
export const validateUpdateDriverIds = validateParams(zodUpdateDriverIdSchema);

