import { Response } from 'express';
import mongoose from 'mongoose';
import { participantsServices } from './participants.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchParticipantsQueryInput } from './participants.validation';

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all participants (paginated + searchable).
 * TM: sets createdBy = userId; Standalone: sets standAloneId = userId.
 * GET /api/v1/participants/get-participants
 */
export const getAllParticipants = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchParticipantsQueryInput) };

  // Standalone: use own userId to find docs where createdBy OR standAloneId matches
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await participantsServices.getAllParticipants(query);
  ServerResponse(res, true, 200, 'Participants retrieved successfully', result);
});

/**
 * Controller: Get a single participant by ID.
 * GET /api/v1/participants/get-participant/:id
 */
export const getParticipantById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let standAloneId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    standAloneId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    // TM accesses through the client's standAloneId (already validated by middleware)
    standAloneId = req.query?.standAloneId as string;
  }

  const result = await participantsServices.getParticipantById(id as string, standAloneId);
  ServerResponse(res, true, 200, 'Participant retrieved successfully', result);
});

/**
 * Controller: Create a new participant as a Transport Manager.
 * POST /api/v1/participants/create-participant
 */
export const createParticipantAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await participantsServices.createParticipantAsManager(req.body);
  if (!result) throw new Error('Failed to create participant');
  ServerResponse(res, true, 201, 'Participant created successfully', result);
});

/**
 * Controller: Create a new participant as a Standalone User.
 * POST /api/v1/participants/create-stand-alone-participant
 */
export const createParticipantAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await participantsServices.createParticipantAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create participant');
  ServerResponse(res, true, 201, 'Participant created successfully', result);
});

/**
 * Controller: Update a participant.
 * PATCH /api/v1/participants/update-participant-by-manager/:participantId/:standAloneId  (TM)
 * PATCH /api/v1/participants/update-participant/:id  (Standalone)
 */
export const updateParticipant = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const participantId = paramToString(req.params.participantId ?? req.params.id);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await participantsServices.updateParticipant(participantId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Participant updated successfully', result);
});

/**
 * Controller: Delete a participant.
 * DELETE /api/v1/participants/delete-participant-by-manager/:participantId/:standAloneId  (TM)
 * DELETE /api/v1/participants/delete-participant/:id  (Standalone)
 */
export const deleteParticipant = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const participantId = paramToString(req.params.participantId ?? req.params.id);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await participantsServices.deleteParticipant(participantId as string, accessId);
  ServerResponse(res, true, 200, 'Participant deleted successfully');
});

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT ROLE CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all participant roles (paginated).
 * GET /api/v1/participants/get-roles
 */
export const getAllRoles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchParticipantsQueryInput) };

  // Standalone: use own userId to find docs where createdBy OR standAloneId matches
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await participantsServices.getAllRoles(query);
  ServerResponse(res, true, 200, 'Roles retrieved successfully', result);
});

/**
 * Controller: Create a new participant role as a Transport Manager.
 * POST /api/v1/participants/create-role
 */
export const createRoleAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await participantsServices.createRoleAsManager(req.body);
  if (!result) throw new Error('Failed to create role');
  ServerResponse(res, true, 201, 'Role created successfully', result);
});

/**
 * Controller: Create a new participant role as a Standalone User.
 * POST /api/v1/participants/create-stand-alone-role
 */
export const createRoleAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await participantsServices.createRoleAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create role');
  ServerResponse(res, true, 201, 'Role created successfully', result);
});

/**
 * Controller: Update a participant role.
 * PATCH /api/v1/participants/update-role-by-manager/:roleId/:standAloneId  (TM)
 * PATCH /api/v1/participants/update-role/:id  (Standalone)
 */
export const updateRole = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const roleId = paramToString(req.params.roleId ?? req.params.id);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await participantsServices.updateRole(roleId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Role updated successfully', result);
});

/**
 * Controller: Delete a participant role.
 * DELETE /api/v1/participants/delete-role-by-manager/:roleId/:standAloneId  (TM)
 * DELETE /api/v1/participants/delete-role/:id  (Standalone)
 */
export const deleteRole = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const roleId = paramToString(req.params.roleId ?? req.params.id);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await participantsServices.deleteRole(roleId as string, accessId);
  ServerResponse(res, true, 200, 'Role deleted successfully');
});