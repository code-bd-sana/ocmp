import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';
import { AuditStatus } from '../../models/compliance-enforcement-dvsa/auditsAndRecificationReports.schema';

const auditStatusValues = Object.values(AuditStatus) as [AuditStatus, ...AuditStatus[]];
const mongoIdStringSchema = z
  .string({ message: 'Please provide a valid MongoDB ObjectId' })
  .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' });

const zodSearchAuditAndRecificationReportsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

const zodAuditAndRecificationReportIdParamSchema = z
  .object({
    id: mongoIdStringSchema,
  })
  .strict();

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

const attachmentIdsSchema = z
  .array(
    z
      .string()
      .refine(isMongoId, { message: 'Each attachment must be a valid MongoDB ObjectId' })
  )
  .optional();

const baseAuditAndRecificationReportFields = {
  auditDate: z
    .string({ message: 'Audit date must be a valid ISO date string' })
    .datetime({ message: 'Audit date must be a valid ISO date string' })
    .optional(),
  title: z
    .string({ message: 'Audit title is required' })
    .min(1, 'Audit title must be at least 1 character')
    .max(150, 'Audit title must not exceed 150 characters'),
  type: z
    .string({ message: 'Audit type is required' })
    .min(1, 'Audit type must be at least 1 character')
    .max(150, 'Audit type must not exceed 150 characters'),
  auditDetails: z.string({ message: 'Audit details must be a string' }).optional(),
  status: z.enum(auditStatusValues).optional(),
  responsiblePerson: z
    .string({ message: 'Responsible person must be a string' })
    .min(1, 'Responsible person must be at least 1 character')
    .max(150, 'Responsible person must not exceed 150 characters')
    .optional(),
  finalizeDate: z
    .string({ message: 'Finalize date must be a valid ISO date string' })
    .datetime({ message: 'Finalize date must be a valid ISO date string' })
    .optional(),
  attachments: attachmentIdsSchema,
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

const zodUpdateAuditAndRecificationReportSchema = z
  .object({
    auditDate: z
      .string({ message: 'Audit date must be a valid ISO date string' })
      .datetime({ message: 'Audit date must be a valid ISO date string' })
      .optional(),
    title: z
      .string({ message: 'Audit title must be a string' })
      .min(1, 'Audit title must be at least 1 character')
      .max(150, 'Audit title must not exceed 150 characters')
      .optional(),
    type: z
      .string({ message: 'Audit type must be a string' })
      .min(1, 'Audit type must be at least 1 character')
      .max(150, 'Audit type must not exceed 150 characters')
      .optional(),
    auditDetails: z.string({ message: 'Audit details must be a string' }).optional(),
    status: z.enum(auditStatusValues).optional(),
    responsiblePerson: z
      .string({ message: 'Responsible person must be a string' })
      .min(1, 'Responsible person must be at least 1 character')
      .max(150, 'Responsible person must not exceed 150 characters')
      .optional(),
    finalizeDate: z
      .string({ message: 'Finalize date must be a valid ISO date string' })
      .datetime({ message: 'Finalize date must be a valid ISO date string' })
      .optional(),
    attachments: attachmentIdsSchema,
    removeAttachmentIds: z
      .union([
        z.string().refine(isMongoId, {
          message: 'Please provide a valid MongoDB ObjectId',
        }),
        z.array(
          z.string().refine(isMongoId, {
            message: 'Please provide a valid MongoDB ObjectId',
          })
        ),
      ])
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const validateCreateAuditAndRecificationReportAsManager = validateBody(
  zodCreateAuditAndRecificationReportAsManagerSchema
);
export const validateCreateAuditAndRecificationReportAsStandAlone = validateBody(
  zodCreateAuditAndRecificationReportAsStandAloneSchema
);
export const validateUpdateAuditAndRecificationReport = validateBody(
  zodUpdateAuditAndRecificationReportSchema
);
export const validateAuditAndRecificationReportIdParam = validateParams(
  zodAuditAndRecificationReportIdParamSchema
);
export const validateAuditAndRecificationReportIdParamAsManager = validateParams(
  zodAuditAndRecificationReportAndManagerIdParamSchema
);
export const validateSearchAuditAndRecificationReportsQueries = validateQuery(
  zodSearchAuditAndRecificationReportsSchema
);

export type SearchAuditAndRecificationReportsQueryInput = z.infer<
  typeof zodSearchAuditAndRecificationReportsSchema
>;
export type AuditAndRecificationReportIdParamInput = z.infer<
  typeof zodAuditAndRecificationReportIdParamSchema
>;
export type AuditAndRecificationReportAsManagerIdParamInput = z.infer<
  typeof zodAuditAndRecificationReportAndManagerIdParamSchema
>;
export type CreateAuditAndRecificationReportAsManagerInput = z.infer<
  typeof zodCreateAuditAndRecificationReportAsManagerSchema
>;
export type CreateAuditAndRecificationReportAsStandAloneInput = z.infer<
  typeof zodCreateAuditAndRecificationReportAsStandAloneSchema
>;
export type UpdateAuditAndRecificationReportInput = z.infer<
  typeof zodUpdateAuditAndRecificationReportSchema
>;
