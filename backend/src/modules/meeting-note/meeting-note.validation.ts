import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { AttendanceType } from '../../models/meeting-note/meetingNote.schema';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Meeting-note Validation Schemas and Types
 *
 * This module defines Zod schemas for validating meeting-note related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

const baseMeetingNoteFields = {
  meetingDate: z.coerce.date({ message: 'Meeting date must be a valid date string' }),
  attendance: z.enum(Object.values(AttendanceType) as [string, ...string[]]).optional(),
  keyDiscussionPoints: z
    .string()
    .max(250, 'Key discussion points must not exceed 250 characters')
    .optional(),
  discussion: z.string().max(2000, 'Discussion must not exceed 2000 characters').optional(),
};

/**
 * Zod schema for validating data when **creating** a single meeting-note.
 *
 * → Add all **required** fields here
 */
const zodCreateMeetingNoteAsManagerSchema = z
  .object({
    // Example fields — replace / expand as needed:
    ...baseMeetingNoteFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateMeetingNoteInputAsManager = z.infer<typeof zodCreateMeetingNoteAsManagerSchema>;

/**
 * Zod schema for validating data when **creating** a single meeting-note.
 *
 * → Add all **required** fields here
 */
const zodCreateMeetingNoteAsStandaloneSchema = z
  .object({
    ...baseMeetingNoteFields,
  })
  .strict();

export type CreateMeetingNoteInputAsStandalone = z.infer<
  typeof zodCreateMeetingNoteAsStandaloneSchema
>;

// Legacy type for backward compatibility
export type CreateMeetingNoteInput =
  | CreateMeetingNoteInputAsManager
  | CreateMeetingNoteInputAsStandalone;

/**
 * Zod schema for validating data when **updating** an existing meeting-note.
 *
 * → All fields should usually be .optional()
 */
const zodUpdateMeetingNoteSchema = zodCreateMeetingNoteAsManagerSchema
  .pick({
    meetingDate: true,
    attendance: true,
    keyDiscussionPoints: true,
    discussion: true,
  })
  .partial()
  .refine(
    (data) => {
      // Ensure at least one field is provided for update
      return Object.keys(data).length > 0;
    },
    { message: 'At least one field must be provided for update' }
  )
  .strict();

export type UpdateMeetingNoteInput = z.infer<typeof zodUpdateMeetingNoteSchema>;

/**
 * Zod schema for validating search query parameters when retrieving multiple compliance-timetables.
 * This can be extended with meeting note specific search parameters as needed.
 */

const zodMeetingNoteSearchSchema = zodSearchQuerySchema.extend({
  // You can add meeting-note-specific search query parameters here if needed
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});
export type SearchMeetingNoteQueryInput = z.infer<typeof zodMeetingNoteSearchSchema>;

/**
 * Zod schema for validating the deletion of a meeting note, ensuring the provided IDs are valid MongoDB ObjectIds.
 */
const zodMeetingNoteAndManagerIdSchema = z.object({
  id: z.string().refine(isMongoId, {
    message: 'Please provide a valid MongoDB ObjectId for meeting note ID',
  }),
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
});

export type MeetingNoteAndManagerIdInput = z.infer<typeof zodMeetingNoteAndManagerIdSchema>;

/** Standalone user: single id param */
const zodMeetingNoteIdParamSchema = z
  .object({
    id: z
      .string({ message: 'Meeting note id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type MeetingNoteIdParamInput = z.infer<typeof zodMeetingNoteIdParamSchema>;

const zodGetMeetingNoteByIdParamsSchema = z
  .object({
    id: z.string({ message: 'Id is required' }).refine(isMongoId, {
      message: 'Please provide a valid MongoDB ObjectId for meeting note ID',
    }),
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
      .optional(),
  })
  .strict();

export type GetMeetingNoteByIdParamsInput = z.infer<typeof zodGetMeetingNoteByIdParamsSchema>;

/**
 * Zod schema for validating the deletion of a meeting note, ensuring the provided IDs are valid MongoDB ObjectIds.
 */

const zodDeleteMeetingNoteSchema = zodMeetingNoteAndManagerIdSchema.strict();

export type DeleteMeetingNoteInput = z.infer<typeof zodDeleteMeetingNoteSchema>;

const zodUpdateMeetingNoteIdSchema = zodMeetingNoteAndManagerIdSchema.strict();

export type UpdateMeetingNoteInputWithIds = z.infer<typeof zodUpdateMeetingNoteIdSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateGetMeetingNoteByIdParams = validateParams(zodGetMeetingNoteByIdParamsSchema);
export const validateSearchMeetingNoteQueries = validateQuery(zodMeetingNoteSearchSchema);
export const validateCreateMeetingNoteAsManager = validateBody(zodCreateMeetingNoteAsManagerSchema);
export const validateCreateMeetingNoteAsStandalone = validateBody(
  zodCreateMeetingNoteAsStandaloneSchema
);
export const validateUpdateMeetingNote = validateBody(zodUpdateMeetingNoteSchema);
export const validateUpdateMeetingNoteIds = validateParams(zodUpdateMeetingNoteIdSchema);
export const validateDeleteMeetingNote = validateParams(zodDeleteMeetingNoteSchema);
export const validateDeleteMeetingNoteIds = validateParams(zodDeleteMeetingNoteSchema);
