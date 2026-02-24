import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Subcontractor Validation Schemas and Types
 *
 * This module defines Zod schemas for validating subcontractor related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single subcontractor.
 *
 * → Add all **required** fields here
 */
const zodCreateSubcontractorSchema = z
  .object({
    insurancePolicyNumber: z.string().optional(),
    insuranceExpiryDate: z.coerce.date({ message: 'insurance expiry date is required' }),
    gitPolicyNumber: z.string().optional(),
    gitExpiryDate: z.coerce.date({ message: 'git expiry date is required' }),
    gitCover: z.number().optional(),
    hiabAvailable: z.boolean().optional(),
    otherCapabilities: z.string().optional(),
    startDateOfAgreement: z.coerce.date({ message: 'start date of agreement is required' }),
    rating: z.number().min(0).max(5).optional(),
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
    checkedBy: z.string().optional(),
  })
  .strict();
export type CreateSubcontractorInput = z.infer<typeof zodCreateSubcontractorSchema>;

/**
 * Zod schema for validating **bulk creation** (array of subcontractor objects).
 */
const zodCreateManySubcontractorSchema = z
  .array(zodCreateSubcontractorSchema)
  .min(1, { message: 'At least one subcontractor must be provided for bulk creation' });

export type CreateManySubcontractorInput = z.infer<typeof zodCreateManySubcontractorSchema>;

/**
 * Zod schema for validating data when **updating** an existing subcontractor.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateSubcontractorSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateSubcontractorInput = z.infer<typeof zodUpdateSubcontractorSchema>;

/**
 * Zod schema for validating bulk updates (array of partial subcontractor objects).
 */
const zodUpdateManySubcontractorForBulkSchema = zodUpdateSubcontractorSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple subcontractor updates.
 */
const zodUpdateManySubcontractorSchema = z
  .array(zodUpdateManySubcontractorForBulkSchema)
  .min(1, { message: 'At least one subcontractor update object must be provided' });

export type UpdateManySubcontractorInput = z.infer<typeof zodUpdateManySubcontractorSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateSubcontractor = validateBody(zodCreateSubcontractorSchema);
export const validateCreateManySubcontractor = validateBody(zodCreateManySubcontractorSchema);
export const validateUpdateSubcontractor = validateBody(zodUpdateSubcontractorSchema);
export const validateUpdateManySubcontractor = validateBody(zodUpdateManySubcontractorSchema);
