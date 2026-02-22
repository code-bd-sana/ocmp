import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';
import { CheckStatus } from '../../models';

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
const zodUpdateDriverSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateDriverInput = z.infer<typeof zodUpdateDriverSchema>;

/**
 * Zod schema for validating bulk updates (array of partial driver objects).
 */
const zodUpdateManyDriverForBulkSchema = zodUpdateDriverSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple driver updates.
 */
const zodUpdateManyDriverSchema = z
  .array(zodUpdateManyDriverForBulkSchema)
  .min(1, { message: 'At least one driver update object must be provided' });

export type UpdateManyDriverInput = z.infer<typeof zodUpdateManyDriverSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateDriverAsTransportManager = validateBody(
  zodCreateDriverAsTransportManagerSchema
);
export const validateCreateDriverAsStandAlone = validateBody(zodCreateDriverAsStandAloneSchema);
export const validateUpdateDriver = validateBody(zodUpdateDriverSchema);
export const validateUpdateManyDriver = validateBody(zodUpdateManyDriverSchema);

