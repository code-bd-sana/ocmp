import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/**
 * Participants & ParticipantRole Validation Schemas
 * Supports both Transport Manager and Standalone User roles.
 */

// ─── Param schemas ───────────────────────────────────────────────────

/** Standalone user: single participantId param */
const zodParticipantIdParamSchema = z
  .object({
    participantId: z
      .string({ message: 'Participant id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type ParticipantIdParamInput = z.infer<typeof zodParticipantIdParamSchema>;

/** TM: participantId + standAloneId params */
const zodParticipantAndManagerIdParamSchema = z
  .object({
    participantId: z
      .string({ message: 'Participant id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for participant ID' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type ParticipantAndManagerIdParamInput = z.infer<typeof zodParticipantAndManagerIdParamSchema>;

/** Standalone user: single roleId param */
const zodRoleIdParamSchema = z
  .object({
    roleId: z
      .string({ message: 'Role id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type RoleIdParamInput = z.infer<typeof zodRoleIdParamSchema>;

/** TM: roleId + standAloneId params */
const zodRoleAndManagerIdParamSchema = z
  .object({
    roleId: z
      .string({ message: 'Role id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for role ID' }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type RoleAndManagerIdParamInput = z.infer<typeof zodRoleAndManagerIdParamSchema>;

// ─── Participant body schemas ────────────────────────────────────────

/** Base participant fields (shared between TM and standalone create) */
const baseParticipantFields = {
  firstName: z
    .string({ message: 'First name is required' })
    .min(1, 'First name cannot be empty')
    .max(100, 'First name is too long')
    .trim(),
  lastName: z
    .string({ message: 'Last name is required' })
    .min(1, 'Last name cannot be empty')
    .max(100, 'Last name is too long')
    .trim(),
  role: z
    .string({ message: 'Role id is required' })
    .refine(isMongoId, { message: 'Please provide a valid role ObjectId' }),
  employmentStatus: z.boolean({ message: 'Employment status is required (true/false)' }),
};

/** TM create: standAloneId is REQUIRED */
const zodCreateParticipantAsManagerSchema = z
  .object({
    ...baseParticipantFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateParticipantAsManagerInput = z.infer<typeof zodCreateParticipantAsManagerSchema>;

/** Standalone create: no standAloneId needed */
const zodCreateParticipantAsStandAloneSchema = z
  .object({
    ...baseParticipantFields,
  })
  .strict();

export type CreateParticipantAsStandAloneInput = z.infer<typeof zodCreateParticipantAsStandAloneSchema>;

// Legacy union type
export type CreateParticipantInput = CreateParticipantAsManagerInput | CreateParticipantAsStandAloneInput;

/** Update participant (shared for both roles) */
const zodUpdateParticipantSchema = z
  .object({
    firstName: z
      .string({ message: 'First name must be a string' })
      .min(1, 'First name cannot be empty')
      .max(100, 'First name is too long')
      .trim()
      .optional(),
    lastName: z
      .string({ message: 'Last name must be a string' })
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name is too long')
      .trim()
      .optional(),
    role: z
      .string({ message: 'Role id must be a string' })
      .refine(isMongoId, { message: 'Please provide a valid role ObjectId' })
      .optional(),
    employmentStatus: z.boolean({ message: 'Employment status must be true/false' }).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
  });

export type UpdateParticipantInput = z.infer<typeof zodUpdateParticipantSchema>;

// ─── Role body schemas ──────────────────────────────────────────────

/** TM create role: standAloneId is REQUIRED */
const zodCreateRoleAsManagerSchema = z
  .object({
    roleName: z
      .string({ message: 'Role name is required' })
      .min(1, 'Role name cannot be empty')
      .max(100, 'Role name is too long')
      .trim(),
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateRoleAsManagerInput = z.infer<typeof zodCreateRoleAsManagerSchema>;

/** Standalone create role: no standAloneId needed */
const zodCreateRoleAsStandAloneSchema = z
  .object({
    roleName: z
      .string({ message: 'Role name is required' })
      .min(1, 'Role name cannot be empty')
      .max(100, 'Role name is too long')
      .trim(),
  })
  .strict();

export type CreateRoleAsStandAloneInput = z.infer<typeof zodCreateRoleAsStandAloneSchema>;

// Legacy union type
export type CreateRoleInput = CreateRoleAsManagerInput | CreateRoleAsStandAloneInput;

/** Update role (shared for both roles) */
const zodUpdateRoleSchema = z
  .object({
    roleName: z
      .string({ message: 'Role name must be a string' })
      .min(1, 'Role name cannot be empty')
      .max(100, 'Role name is too long')
      .trim(),
  })
  .strict();

export type UpdateRoleInput = z.infer<typeof zodUpdateRoleSchema>;

// ─── Search query schema ────────────────────────────────────────────

/** Extends base search query with standAloneId for TM filtering */
const zodSearchParticipantsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchParticipantsQueryInput = z.infer<typeof zodSearchParticipantsSchema>;

// ─── Validators ─────────────────────────────────────────────────────

// Param validators
export const validateParticipantIdParam = validateParams(zodParticipantIdParamSchema);
export const validateParticipantAndManagerIdParam = validateParams(zodParticipantAndManagerIdParamSchema);
export const validateRoleIdParam = validateParams(zodRoleIdParamSchema);
export const validateRoleAndManagerIdParam = validateParams(zodRoleAndManagerIdParamSchema);

// Participant body validators
export const validateCreateParticipantAsManager = validateBody(zodCreateParticipantAsManagerSchema);
export const validateCreateParticipantAsStandAlone = validateBody(zodCreateParticipantAsStandAloneSchema);
export const validateUpdateParticipant = validateBody(zodUpdateParticipantSchema);

// Role body validators
export const validateCreateRoleAsManager = validateBody(zodCreateRoleAsManagerSchema);
export const validateCreateRoleAsStandAlone = validateBody(zodCreateRoleAsStandAloneSchema);
export const validateUpdateRole = validateBody(zodUpdateRoleSchema);

// Search query validators
export const validateSearchParticipantsQueries = validateQuery(zodSearchParticipantsSchema);