import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import { AuditStatus } from '../../models/compliance-enforcement-dvsa/auditsAndRecificationReports.schema';

const zodSearchAuditAndRecificationReportsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});
export type SearchAuditAndRecificationReportsQueryInput = z.infer<typeof zodSearchAuditAndRecificationReportsSchema>;


const zodAuditAndRecificationReportIdParamSchema = z
  .object({
    id: z
      .string({ message: 'audit and recification id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

  export type AuditAndRecificationReportIdParamInput = z.infer<typeof zodAuditAndRecificationReportIdParamSchema>;

const zodAuditAndRecificationReportAndManagerIdParamSchema = z
  .object({
    id: z
      .string({ message: 'Audit and recification id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for auditAndRecificationId' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type AuditAndRecificationReportAsManagerIdParamInput = z.infer<typeof zodAuditAndRecificationReportAndManagerIdParamSchema>;


const baseAuditAndRecificationReportFields = {
  auditDate: z
    .string({ message: 'Audit date date is required' })
    .datetime({ message: 'Audit date must be a valid ISO date string' })
    .optional(),
  title: z
    .string({ message: 'Audit title is required' })
    .min(1, 'Audit title must be at least 1 character')
    .max(150, 'Audit title must not exceed 150 characters'),
  type: z
    .string({ message: 'Audit type is must be a string' })
    .optional(),
  auditDetails: z
    .string({ message: 'Audit details must be a string' })
    .optional(),
  status: z
    .enum(Object.keys(AuditStatus) as [string, ...string[]])
    .optional(),
  responsiblePerson: z
    .string({ message: 'Responsible person must be a string' })
    .min(1, 'Responsible person must be at least 1 character')
    .max(150, 'Responsible person must not exceed 150 characters')
    .optional(),
  finalizeDate: z
    .string({ message: 'Finalize date must be a valid ISO date string' })
    .datetime({ message: 'Finalize date must be a valid ISO date string' })
    .optional(),
  attachments: z //@TODO: this should likely be an array of strings (file URLs or IDs) rather than a single string
    .string({ message: 'Attachments must be a string' })
    .optional(),
};

const zodCreateAuditAndRecificationReportAsStandAloneSchema = z
  .object({
    ...baseAuditAndRecificationReportFields,
  })
  .strict();

const zodCreateAuditAndRecificationReportAsManagerSchema = z
  .object({
    ...baseAuditAndRecificationReportFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

const validateUpdateAuditAndRecificationReportSchema = z
  .object({
    auditDate: z
      .string({ message: 'Audit date is required' })
      .datetime({ message: 'Audit date must be a valid ISO date string' })
      .optional(),
    
    title: z
      .string({ message: 'Audit title is required' })
      .min(1, 'Audit title must be at least 1 character')
      .max(150, 'Audit title must not exceed 150 characters'),
    
    type: z
      .string({ message: 'Audit type is required' })
      .optional(),
    
    auditDetails: z 
      .string({ message: 'Audit details is required' })
      .optional(),
    
    status: z
      .enum(Object.values(AuditStatus) as [string, ...string[]])
      .optional(),
    
    responsiblePerson: z
      .string({ message: 'Responsible person is required' })
      .min(1, 'Responsible person must be at least 1 character')
      .max(150, 'Responsible person must not exceed 150 characters')
      .optional(),
    
    finalizeDate: z
      .string({ message: 'Finalize date is required' })
      .datetime({ message: 'Finalize date must be a valid ISO date string' })
      .optional(),
    
    attachments: z
      .string({ message: 'Attachments must be a string' })
      .optional(),
  })
  .strict() 
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });


export const validateCreateAuditAndRecificationReportAsManager = validateBody(zodCreateAuditAndRecificationReportAsManagerSchema);
export const validateCreateAuditAndRecificationReportAsStandAlone = validateBody(zodCreateAuditAndRecificationReportAsStandAloneSchema);
export const validateUpdateAuditAndRecificationReport = validateBody(validateUpdateAuditAndRecificationReportSchema);
export const validateAuditAndRecificationReportIdParam = validateParams(zodAuditAndRecificationReportIdParamSchema);
export const validateAuditAndRecificationReportIdParamAsManager = validateParams(zodAuditAndRecificationReportAndManagerIdParamSchema);
// Search query validators
export const validateSearchAuditAndRecificationReportsQueries = validateQuery(zodSearchAuditAndRecificationReportsSchema);
export const validateSearchQueries = validateQuery(zodSearchQuerySchema);









export type CreateAuditAndRecificationReportAsManagerInput = z.infer<typeof zodCreateAuditAndRecificationReportAsManagerSchema>;
export type CreateAuditAndRecificationReportAsStandAloneInput = z.infer<typeof zodCreateAuditAndRecificationReportAsStandAloneSchema>;














/**
 * Zod schema for validating data when **updating** an existing audit-and-recification-report.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdateAuditAndRecificationReportSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type UpdateAuditAndRecificationReportInput = z.infer<typeof zodUpdateAuditAndRecificationReportSchema>;

/**
 * Zod schema for validating bulk updates (array of partial audit-and-recification-report objects).
 */
const zodUpdateManyAuditAndRecificationReportForBulkSchema = zodUpdateAuditAndRecificationReportSchema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple audit-and-recification-report updates.
 */
const zodUpdateManyAuditAndRecificationReportSchema = z
  .array(zodUpdateManyAuditAndRecificationReportForBulkSchema)
  .min(1, { message: 'At least one audit-and-recification-report update object must be provided' });


export type UpdateManyAuditAndRecificationReportInput = z.infer<typeof zodUpdateManyAuditAndRecificationReportSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
// export const validateUpdateAuditAndRecificationReport = validateBody(zodUpdateAuditAndRecificationReportSchema);
export const validateUpdateManyAuditAndRecificationReport = validateBody(zodUpdateManyAuditAndRecificationReportSchema);
