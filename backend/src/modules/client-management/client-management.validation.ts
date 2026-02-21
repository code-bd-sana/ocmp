import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams } from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating managerId in URL params.
 */
const zodManagerIdParamSchema = z
  .object({
    managerId: z
      .string({ message: 'Mongodb id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type ManagerIdParamInput = z.infer<typeof zodManagerIdParamSchema>;

/**
 * Zod schema for validating clientId in URL params.
 */
const zodClientIdParamSchema = z
  .object({
    clientId: z
      .string({ message: 'Client id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type ClientManagementBodyInput = z.infer<typeof zodClientIdParamSchema>;

/**
 * Zod schema for creating a new client (TM creates a user: fullName + email).
 */
const zodCreateClientSchema = z
  .object({
    fullName: z
      .string({ message: 'Full name is required' })
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long')
      .trim(),
    email: z.email({ message: 'Invalid email format' }).trim().toLowerCase(),
  })
  .strict();

export type CreateClientInput = z.infer<typeof zodCreateClientSchema>;

/**
 * Zod schema for a client requesting to join a Transport Manager's team.
 * Body: { managerId } — clientId comes from the authenticated user's token.
 */
const zodRequestJoinTeamSchema = z
  .object({
    managerId: z
      .string({ message: 'Manager id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type RequestJoinTeamInput = z.infer<typeof zodRequestJoinTeamSchema>;

/**
 * Zod schema for updating a Transport Manager's client limit.
 */
const zodUpdateClientLimitSchema = z
  .object({
    clientLimit: z
      .number({ message: 'Client limit must be a number' })
      .int({ message: 'Client limit must be an integer' })
      .positive({ message: 'Client limit must be a positive integer' }),
  })
  .strict();

export type UpdateClientLimitInput = z.infer<typeof zodUpdateClientLimitSchema>;

/**
 * Zod schema for TM approving/rejecting a join request.
 * Body: { status: "approved" | "revoked" }
 */
const zodUpdateJoinRequestSchema = z
  .object({
    status: z.enum(['approved', 'revoked'], {
      message: 'Status must be either "approved" or "revoked"',
    }),
  })
  .strict();

export type UpdateJoinRequestInput = z.infer<typeof zodUpdateJoinRequestSchema>;

/**
 * Zod schema for accept/reject action on leave or remove requests.
 * Body: { action: "accept" | "reject" }
 */
const zodActionSchema = z
  .object({
    action: z.enum(['accept', 'reject'], {
      message: 'Action must be either "accept" or "reject"',
    }),
  })
  .strict();

export type ActionInput = z.infer<typeof zodActionSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateManagerIdParam = validateParams(zodManagerIdParamSchema);
export const validateClientIdParam = validateParams(zodClientIdParamSchema);
export const validateCreateClient = validateBody(zodCreateClientSchema);
export const validateRequestJoinTeam = validateBody(zodRequestJoinTeamSchema);
export const validateUpdateClientLimit = validateBody(zodUpdateClientLimitSchema);
export const validateUpdateJoinRequest = validateBody(zodUpdateJoinRequestSchema);
export const validateAction = validateBody(zodActionSchema);