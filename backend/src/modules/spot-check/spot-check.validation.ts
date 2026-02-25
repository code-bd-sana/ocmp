import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Spot-check Validation Schemas and Types
 *
 * Supports both Transport Manager and Standalone User roles.
 */

// Base fields for creation
const baseSpotCheckFields = {
  vehicleId: z
    .string({ message: 'vehicleId is required' })
    .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' }),
  issueDetails: z
    .string({ message: 'issueDetails is required, must be a string' })
    .min(2, 'issueDetails must be at least 2 characters')
    .max(2000, 'issueDetails is too long')
    .trim(),
  // Optional fields
  rectificationRequired: z.string().optional(),
  actionTaken: z.string().optional(),
  dateCompleted: z.string().optional(),
  completedBy: z.string().optional(),
  followUpNeeded: z.string().optional(),
  notes: z.string().optional(),
  attachments: z
    .array(z.string().refine(isMongoId, { message: 'attachments must be valid ObjectIds' }))
    .optional(),
  // createdBy is set server-side in controllers; allow it on the type/schema as optional
  createdBy: z
    .string()
    .refine(isMongoId, { message: 'createdBy must be a valid MongoDB ObjectId' })
    .optional(),
};

/**
 * Transport Manager created: standAloneId is REQUIRED
 */
const zodCreateSpotCheckAsManagerSchema = z
  .object({
    ...baseSpotCheckFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateSpotCheckAsManagerInput = z.infer<typeof zodCreateSpotCheckAsManagerSchema>;

/**
 * Standalone created: no standAloneId
 */
const zodCreateSpotCheckAsStandAloneSchema = z
  .object({
    ...baseSpotCheckFields,
  })
  .strict();

export type CreateSpotCheckAsStandAloneInput = z.infer<typeof zodCreateSpotCheckAsStandAloneSchema>;

// Union type for creating spot-check (either role can use their respective schema)
export type CreateSpotCheckInput = CreateSpotCheckAsManagerInput | CreateSpotCheckAsStandAloneInput;

/**
 * Update spot-check (shared for both roles)
 */
const zodUpdateSpotCheckSchema = z
  .object({
    vehicleId: z
      .string()
      .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' })
      .optional(),
    issueDetails: z.string().min(2).max(2000).optional(),
    rectificationRequired: z.string().optional(),
    actionTaken: z.string().optional(),
    dateCompleted: z.string().optional(),
    completedBy: z.string().optional(),
    followUpNeeded: z.string().optional(),
    notes: z.string().optional(),
    attachments: z.array(z.string().refine(isMongoId)).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateSpotCheckInput = z.infer<typeof zodUpdateSpotCheckSchema>;

/**
 * Search query for spot-checks (supports optional standAloneId for Transport Manager filters)
 */
const zodSearchSpotChecksSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchSpotChecksQueryInput = z.infer<typeof zodSearchSpotChecksSchema>;

// Validators
export const validateCreateSpotCheckAsManager = validateBody(zodCreateSpotCheckAsManagerSchema);
export const validateCreateSpotCheckAsStandAlone = validateBody(
  zodCreateSpotCheckAsStandAloneSchema
);
export const validateUpdateSpotCheck = validateBody(zodUpdateSpotCheckSchema);
export const validateSearchSpotChecksQueries = validateQuery(zodSearchSpotChecksSchema);
