import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Training Records Validation Schemas
 *
 * Two APIs:
 *   1. GET  — grouped report (query: pagination, search, optional status filter)
 *   2. PATCH — update status of an individual register entry (body: status, param: registerId)
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single registerId param */
const zodRecordIdParamSchema = z
  .object({
    registerId: z
      .string({ message: 'Register id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type RecordIdParamInput = z.infer<typeof zodRecordIdParamSchema>;

/** TM: registerId + standAloneId params */
const zodRecordAndManagerIdParamSchema = z
  .object({
    registerId: z
      .string({ message: 'Register id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for register ID' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type RecordAndManagerIdParamInput = z.infer<typeof zodRecordAndManagerIdParamSchema>;

// ─── Body schemas ────────────────────────────────────────────────────

/** Update status of a single training register entry */
const zodUpdateRecordStatusSchema = z
  .object({
    status: z.enum(['Pending', 'Overdue', 'Upcoming', 'Completed'], {
      message: 'Status must be one of: Pending, Overdue, Upcoming, Completed',
    }),
  })
  .strict();

export type UpdateRecordStatusInput = z.infer<typeof zodUpdateRecordStatusSchema>;

// ─── Search / Report query schemas ──────────────────────────────────

/** TM search query: base search fields + standAloneId + optional status filter */
const zodSearchRecordsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
  status: z
    .enum(['Pending', 'Overdue', 'Upcoming', 'Completed'], {
      message: 'Status must be one of: Pending, Overdue, Upcoming, Completed',
    })
    .optional(),
});

export type SearchRecordsQueryInput = z.infer<typeof zodSearchRecordsSchema>;

/** Standalone search query: base search fields + optional status filter (no standAloneId) */
const zodSearchRecordsStandaloneSchema = zodSearchQuerySchema.extend({
  status: z
    .enum(['Pending', 'Overdue', 'Upcoming', 'Completed'], {
      message: 'Status must be one of: Pending, Overdue, Upcoming, Completed',
    })
    .optional(),
});

export type SearchRecordsStandaloneQueryInput = z.infer<typeof zodSearchRecordsStandaloneSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validateRecordIdParam = validateParams(zodRecordIdParamSchema);
export const validateRecordAndManagerIdParam = validateParams(zodRecordAndManagerIdParamSchema);

// Body validators
export const validateUpdateRecordStatus = validateBody(zodUpdateRecordStatusSchema);

// Search query validators
export const validateSearchRecordsQueries = validateQuery(zodSearchRecordsSchema);
export const validateSearchRecordsStandaloneQueries = validateQuery(zodSearchRecordsStandaloneSchema);