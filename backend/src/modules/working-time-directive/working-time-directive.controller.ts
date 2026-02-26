import { Response } from 'express';
import mongoose from 'mongoose';
import { workingTimeDirectiveServices } from './working-time-directive.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchWorkingTimeDirectivesQueryInput } from './working-time-directive.validation';

// ═══════════════════════════════════════════════════════════════
// CREATE CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Create a working time directive as a Transport Manager.
 * POST /api/v1/working-time-directive/create-working-time-directive
 */
export const createWorkingTimeDirectiveAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await workingTimeDirectiveServices.createWorkingTimeDirectiveAsManager(req.body);
  if (!result) throw new Error('Failed to create working time directive');
  ServerResponse(res, true, 201, 'Working time directive created successfully', result);
});

/**
 * Controller: Create a working time directive as a Standalone User.
 * POST /api/v1/working-time-directive/create-stand-alone-working-time-directive
 */
export const createWorkingTimeDirectiveAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await workingTimeDirectiveServices.createWorkingTimeDirectiveAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create working time directive');
  ServerResponse(res, true, 201, 'Working time directive created successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// READ CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all working time directives (paginated + searchable).
 * GET /api/v1/working-time-directive/get-working-time-directives
 */
export const getAllWorkingTimeDirectives = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchWorkingTimeDirectivesQueryInput) };

  // Standalone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await workingTimeDirectiveServices.getAllWorkingTimeDirectives(query);
  ServerResponse(res, true, 200, 'Working time directives retrieved successfully', result);
});

/**
 * Controller: Get a single working time directive by ID.
 * GET /api/v1/working-time-directive/get-working-time-directive/:workingTimeDirectiveId
 */
export const getWorkingTimeDirectiveById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { workingTimeDirectiveId } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = req.query?.standAloneId as string;
  }

  const result = await workingTimeDirectiveServices.getWorkingTimeDirectiveById(workingTimeDirectiveId as string, accessId);
  ServerResponse(res, true, 200, 'Working time directive retrieved successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// UPDATE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Update a working time directive.
 * PATCH /api/v1/working-time-directive/update-working-time-directive-by-manager/:workingTimeDirectiveId/:standAloneId  (TM)
 * PATCH /api/v1/working-time-directive/update-working-time-directive/:workingTimeDirectiveId  (Standalone)
 */
export const updateWorkingTimeDirective = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const workingTimeDirectiveId = paramToString(req.params.workingTimeDirectiveId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await workingTimeDirectiveServices.updateWorkingTimeDirective(workingTimeDirectiveId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Working time directive updated successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// DELETE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Delete a working time directive.
 * DELETE /api/v1/working-time-directive/delete-working-time-directive-by-manager/:workingTimeDirectiveId/:standAloneId  (TM)
 * DELETE /api/v1/working-time-directive/delete-working-time-directive/:workingTimeDirectiveId  (Standalone)
 */
export const deleteWorkingTimeDirective = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const workingTimeDirectiveId = paramToString(req.params.workingTimeDirectiveId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await workingTimeDirectiveServices.deleteWorkingTimeDirective(workingTimeDirectiveId as string, accessId);
  ServerResponse(res, true, 200, 'Working time directive deleted successfully');
});

// ═══════════════════════════════════════════════════════════════
// DRIVERS WITH VEHICLES CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all drivers with their vehicle lists.
 * TM sends standAloneId as query param; Standalone uses own userId.
 * GET /api/v1/working-time-directive/get-drivers-with-vehicles
 */
export const getDriversWithVehicles = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  let accessId: string;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  } else {
    // TM — standAloneId comes from query (already validated by validateClientForManagerMiddleware)
    accessId = req.query?.standAloneId as string;
  }

  const result = await workingTimeDirectiveServices.getDriversWithVehicles(accessId);
  ServerResponse(res, true, 200, 'Drivers with vehicles retrieved successfully', result);
});
