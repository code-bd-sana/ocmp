import { Response } from 'express';
import { trainingServices } from './training.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';

/**
 * Controller: Create a new training sheet.
 * POST /api/v1/training
 */
export const createTraining = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const creatorId = req.user!._id;
  const result = await trainingServices.createTraining(creatorId, req.body);
  ServerResponse(res, true, 201, 'Training created successfully', result);
});

/**
 * Controller: Get all trainings for the authenticated TM (summary — first intervalDay only).
 * GET /api/v1/training
 */
export const getAllTrainings = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const creatorId = req.user!._id;
  const result = await trainingServices.getAllTrainings(creatorId);
  ServerResponse(res, true, 200, 'Trainings retrieved successfully', result);
});

/**
 * Controller: Get a single training with all intervalDays.
 * GET /api/v1/training/:trainingId
 */
export const getTrainingById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const creatorId = req.user!._id;
  const { trainingId } = req.params;
  const result = await trainingServices.getTrainingById(creatorId, trainingId as string);
  ServerResponse(res, true, 200, 'Training retrieved successfully', result);
});

/**
 * Controller: Update a training.
 * PATCH /api/v1/training/:trainingId
 */
export const updateTraining = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const creatorId = req.user!._id;
  const { trainingId } = req.params;
  const result = await trainingServices.updateTraining(creatorId, trainingId as string, req.body);
  ServerResponse(res, true, 200, 'Training updated successfully', result);
});

/**
 * Controller: Delete a training.
 * DELETE /api/v1/training/:trainingId
 */
export const deleteTraining = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const creatorId = req.user!._id;
  const { trainingId } = req.params;
  await trainingServices.deleteTraining(creatorId, trainingId as string);
  ServerResponse(res, true, 200, 'Training deleted successfully');
});