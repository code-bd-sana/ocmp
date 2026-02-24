import { Response } from 'express';
import mongoose from 'mongoose';
import { trainingServices } from './training.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchTrainingsQueryInput } from './training.validation';

// ═══════════════════════════════════════════════════════════════
// TRAINING CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Create a new training as a Transport Manager.
 * POST /api/v1/training/create-training
 */
export const createTrainingAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await trainingServices.createTrainingAsManager(req.body);
  if (!result) throw new Error('Failed to create training');
  ServerResponse(res, true, 201, 'Training created successfully', result);
});

/**
 * Controller: Create a new training as a Standalone User.
 * POST /api/v1/training/create-stand-alone-training
 */
export const createTrainingAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await trainingServices.createTrainingAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create training');
  ServerResponse(res, true, 201, 'Training created successfully', result);
});

/**
 * Controller: Get all trainings (paginated + searchable).
 * GET /api/v1/training/get-trainings
 */
export const getAllTrainings = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchTrainingsQueryInput) };

  // Standalone: use own userId to find docs where createdBy OR standAloneId matches
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await trainingServices.getAllTrainings(query);
  ServerResponse(res, true, 200, 'Trainings retrieved successfully', result);
});

/**
 * Controller: Get a single training with all intervalDays.
 * GET /api/v1/training/get-training/:trainingId  (standalone)
 * GET /api/v1/training/get-training/:trainingId?standAloneId=xxx  (TM)
 */
export const getTrainingById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { trainingId } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    // TM accesses through the client's standAloneId (already validated by middleware)
    accessId = req.query?.standAloneId as string;
  }

  const result = await trainingServices.getTrainingById(trainingId as string, accessId);
  ServerResponse(res, true, 200, 'Training retrieved successfully', result);
});

/**
 * Controller: Update a training.
 * PATCH /api/v1/training/update-training-by-manager/:trainingId/:standAloneId  (TM)
 * PATCH /api/v1/training/update-training/:trainingId  (Standalone)
 */
export const updateTraining = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const trainingId = paramToString(req.params.trainingId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await trainingServices.updateTraining(trainingId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Training updated successfully', result);
});

/**
 * Controller: Delete a training.
 * DELETE /api/v1/training/delete-training-by-manager/:trainingId/:standAloneId  (TM)
 * DELETE /api/v1/training/delete-training/:trainingId  (Standalone)
 */
export const deleteTraining = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const trainingId = paramToString(req.params.trainingId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await trainingServices.deleteTraining(trainingId as string, accessId);
  ServerResponse(res, true, 200, 'Training deleted successfully');
});