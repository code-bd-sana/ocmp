import { Response } from 'express';
import mongoose from 'mongoose';
import { trainingRegisterServices } from './training-register.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchRegistersQueryInput } from './training-register.validation';

// ═══════════════════════════════════════════════════════════════
// CREATE CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Create a training register entry as a Transport Manager.
 * POST /api/v1/training-register/create-register
 */
export const createRegisterAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await trainingRegisterServices.createRegisterAsManager(req.body);
  if (!result) throw new Error('Failed to create training register entry');
  ServerResponse(res, true, 201, 'Training register entry created successfully', result);
});

/**
 * Controller: Create a training register entry as a Standalone User.
 * POST /api/v1/training-register/create-stand-alone-register
 */
export const createRegisterAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await trainingRegisterServices.createRegisterAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create training register entry');
  ServerResponse(res, true, 201, 'Training register entry created successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// READ CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all training register entries (paginated + searchable).
 * GET /api/v1/training-register/get-registers
 */
export const getAllRegisters = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchRegistersQueryInput) };

  // Standalone: use own userId to find docs where createdBy OR standAloneId matches
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await trainingRegisterServices.getAllRegisters(query);
  ServerResponse(res, true, 200, 'Training register entries retrieved successfully', result);
});

/**
 * Controller: Get a single training register entry by ID.
 * GET /api/v1/training-register/get-register/:registerId
 */
export const getRegisterById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { registerId } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    // TM accesses through the client's standAloneId (already validated by middleware)
    accessId = req.query?.standAloneId as string;
  }

  const result = await trainingRegisterServices.getRegisterById(registerId as string, accessId);
  ServerResponse(res, true, 200, 'Training register entry retrieved successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// UPDATE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Update a training register entry.
 * PATCH /api/v1/training-register/update-register-by-manager/:registerId/:standAloneId  (TM)
 * PATCH /api/v1/training-register/update-register/:registerId  (Standalone)
 */
export const updateRegister = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const registerId = paramToString(req.params.registerId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await trainingRegisterServices.updateRegister(registerId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Training register entry updated successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// DELETE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Delete a training register entry.
 * DELETE /api/v1/training-register/delete-register-by-manager/:registerId/:standAloneId  (TM)
 * DELETE /api/v1/training-register/delete-register/:registerId  (Standalone)
 */
export const deleteRegister = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const registerId = paramToString(req.params.registerId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await trainingRegisterServices.deleteRegister(registerId as string, accessId);
  ServerResponse(res, true, 200, 'Training register entry deleted successfully');
});