import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ocrsPlanServices } from './ocrs-plan.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';

/**
 * Controller function to handle the creation of a single ocrs-plan.
 *
 * @param {Request} req - The request object containing ocrs-plan data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>>} - The created ocrs-plan.
 * @throws {Error} - Throws an error if the ocrs-plan creation fails.
 */
export const createOcrsPlanAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);

    const result = await ocrsPlanServices.createOcrsPlan(req.body);
    if (!result) throw new Error('Failed to create ocrs-plan');
    ServerResponse(res, true, 201, 'Ocrs-plan created successfully', result);
  }
);

export const createOcrsPlanAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);

    const result = await ocrsPlanServices.createOcrsPlan(req.body);
    if (!result) throw new Error('Failed to create ocrs-plan');
    ServerResponse(res, true, 201, 'Ocrs-plan created successfully', result);
  }
);

/**
 * Controller function to handle the creation of multiple ocrs-plans.
 *
 * @param {Request} req - The request object containing an array of ocrs-plan data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>[]>} - The created ocrs-plans.
 * @throws {Error} - Throws an error if the ocrs-plans creation fails.
 */
/**
 * Controller function to handle the update operation for a single ocrs-plan.
 *
 * @param {Request} req - The request object containing the ID of the ocrs-plan to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>>} - The updated ocrs-plan.
 * @throws {Error} - Throws an error if the ocrs-plan update fails.
 */
export const updateOcrsPlan = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  const result = await ocrsPlanServices.updateOcrsPlan(
    id as string,
    req.body,
    req.user!._id,
    standAloneId as string | undefined
  );
  if (!result) {
    return ServerResponse(res, false, 404, 'Ocrs-plan not found or access denied');
  }
  ServerResponse(res, true, 200, 'Ocrs-plan updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple ocrs-plans.
 *
 * @param {Request} req - The request object containing an array of ocrs-plan data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>[]>} - The updated ocrs-plans.
 * @throws {Error} - Throws an error if the ocrs-plans update fails.
 */
/**
 * Controller function to handle the deletion of a single ocrs-plan.
 *
 * @param {Request} req - The request object containing the ID of the ocrs-plan to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>>} - The deleted ocrs-plan.
 * @throws {Error} - Throws an error if the ocrs-plan deletion fails.
 */
export const deleteOcrsPlan = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  const result = await ocrsPlanServices.deleteOcrsPlan(id as string, req.user!._id, standAloneId);
  if (!result) {
    return ServerResponse(res, false, 404, 'Ocrs-plan not found or access denied');
  }
  ServerResponse(res, true, 200, 'Ocrs-plan deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple ocrs-plans.
 *
 * @param {Request} req - The request object containing an array of IDs of ocrs-plan to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>[]>} - The deleted ocrs-plans.
 * @throws {Error} - Throws an error if the ocrs-plan deletion fails.
 */
/**
 * Controller function to handle the retrieval of a single ocrs-plan by ID.
 *
 * @param {Request} req - The request object containing the ID of the ocrs-plan to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>>} - The retrieved ocrs-plan.
 * @throws {Error} - Throws an error if the ocrs-plan retrieval fails.
 */
export const getOcrsPlanById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const ocrsPlanId = paramToString(req.params.id);

  let accessId: string | undefined;
  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = paramToString((req.params as any).standAloneId);
  }

  const result = await ocrsPlanServices.getOcrsPlanById(ocrsPlanId as string, accessId);
  if (!result) throw new Error('Ocrs-plan not found');
  ServerResponse(res, true, 200, 'Ocrs-plan retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple ocrs-plans.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IOcrsPlan>[]>} - The retrieved ocrs-plans.
 * @throws {Error} - Throws an error if the ocrs-plans retrieval fails.
 */
export const getManyOcrsPlan = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = {
    ...((req as any).validatedQuery as SearchQueryInput),
    requesterId: req.user?._id,
    requesterRole: req.user?.role,
  } as any;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }

  const { ocrsPlans, totalData, totalPages } = await ocrsPlanServices.getManyOcrsPlan(query);
  if (!ocrsPlans) throw new Error('Failed to retrieve ocrs-plans');
  ServerResponse(res, true, 200, 'Ocrs-plans retrieved successfully', {
    ocrsPlans,
    totalData,
    totalPages,
  });
});
