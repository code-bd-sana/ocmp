import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Traffic-commissioner-communication Validation Schemas and Types
 *
 * This module defines Zod schemas for validating traffic-commissioner-communication related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Base Zod schema for common communication fields
 */
const baseCommunicationFields = {
  type: z
    .string({ message: 'Communication type is required' })
    .trim()
    .min(2, 'Communication type must be at least 2 characters')
    .max(50, 'Communication type must not exceed 50 characters'),
  contactedPerson: z
    .string({ message: 'Contacted person is required' })
    .trim()
    .min(2, 'Contacted person must be at least 2 characters')
    .max(100, 'Contacted person must not exceed 100 characters'),
  reason: z
    .string({ message: 'Reason for communication is required' })
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  communicationDate: z.coerce.date({
    message: 'Communication date is required and must be a valid date string',
  }),
  attachments: z
    .array(z.string().refine(isMongoId, { message: 'Attachments must be valid MongoDB ObjectIds' }))
    .optional(),
  comments: z.coerce.date({ message: 'Comments must be a valid date string' }).optional(),
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' })
    .optional(),
  createdBy: z
    .string()
    .refine(isMongoId, { message: 'createdBy must be a valid MongoDB ObjectId' })
    .optional(),
};

/**
 * Zod schema for creating a communication as a Transport Manager
 * → standAloneId is REQUIRED (must be one of the manager's approved clients)
 */
const zodCreateTrafficCommissionerCommunicationAsTransportManagerSchema = z
  .object({
    ...baseCommunicationFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateTrafficCommissionerCommunicationAsTransportManagerInput = z.infer<
  typeof zodCreateTrafficCommissionerCommunicationAsTransportManagerSchema
>;

/**
 * Zod schema for creating a communication as a Stand-Alone user
 * → standAloneId is optional (stand-alone users employ their own drivers)
 */
const zodCreateTrafficCommissionerCommunicationAsStandAloneSchema = z
  .object({
    ...baseCommunicationFields,
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' })
      .optional(),
  })
  .strict();

export type CreateTrafficCommissionerCommunicationAsStandAloneInput = z.infer<
  typeof zodCreateTrafficCommissionerCommunicationAsStandAloneSchema
>;

// Legacy type for backward compatibility
export type CreateTrafficCommissionerCommunicationInput =
  | CreateTrafficCommissionerCommunicationAsTransportManagerInput
  | CreateTrafficCommissionerCommunicationAsStandAloneInput;

/**
 * Zod schema for validating data when **updating** an existing traffic-commissioner-communication.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateTrafficCommissionerCommunicationSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateTrafficCommissionerCommunicationInput = z.infer<
  typeof zodUpdateTrafficCommissionerCommunicationSchema
>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateTrafficCommissionerCommunicationAsTransportManager = validateBody(
  zodCreateTrafficCommissionerCommunicationAsTransportManagerSchema
);

export const validateCreateTrafficCommissionerCommunicationAsStandAlone = validateBody(
  zodCreateTrafficCommissionerCommunicationAsStandAloneSchema
);
export const validateUpdateTrafficCommissionerCommunication = validateBody(
  zodUpdateTrafficCommissionerCommunicationSchema
);

