import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { trainingToolboxServices } from './training-toolbox.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';

/**
 * Controller function to handle the creation of a single training-toolbox.
 *
 * @param {Request} req - The request object containing training-toolbox data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The created training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox creation fails.
 */
export const createTrainingToolboxAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.body.deliveredBy && req.user?._id) {
      req.body.deliveredBy = new mongoose.Types.ObjectId(req.user._id);
    }

    const result = await trainingToolboxServices.createTrainingToolbox(req.body);
    if (!result) throw new Error('Failed to create training-toolbox');
    ServerResponse(res, true, 201, 'Training-toolbox created successfully', result);
  }
);

export const createTrainingToolboxAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.body.deliveredBy && req.user?._id) {
      req.body.deliveredBy = new mongoose.Types.ObjectId(req.user._id);
    }

    const result = await trainingToolboxServices.createTrainingToolbox(req.body);
    if (!result) throw new Error('Failed to create training-toolbox');
    ServerResponse(res, true, 201, 'Training-toolbox created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single training-toolbox.
 *
 * @param {Request} req - The request object containing the ID of the training-toolbox to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The updated training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox update fails.
 */
export const updateTrainingToolbox = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    if (req.user?._id) {
      req.body.deliveredBy = req.user._id;
    }

    const result = await trainingToolboxServices.updateTrainingToolbox(
      id as string,
      req.body,
      req.user!._id,
      standAloneId as string | undefined
    );
    if (!result) {
      return ServerResponse(res, false, 404, 'Training-toolbox not found or access denied');
    }
    ServerResponse(res, true, 200, 'Training-toolbox updated successfully', result);
  }
);

/**
 * Controller function to handle the deletion of a single training-toolbox.
 *
 * @param {Request} req - The request object containing the ID of the training-toolbox to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The deleted training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox deletion fails.
 */
export const deleteTrainingToolbox = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    const result = await trainingToolboxServices.deleteTrainingToolbox(
      id as string,
      req.user!._id,
      standAloneId
    );
    if (!result) {
      return ServerResponse(res, false, 404, 'Training-toolbox not found or access denied');
    }
    ServerResponse(res, true, 200, 'Training-toolbox deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single training-toolbox by ID.
 *
 * @param {Request} req - The request object containing the ID of the training-toolbox to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The retrieved training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox retrieval fails.
 */
export const getTrainingToolboxById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the training-toolbox by ID and get the result
  const result = await trainingToolboxServices.getTrainingToolboxById(id as string);
  if (!result) throw new Error('Training-toolbox not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Training-toolbox retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple training-toolboxs.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>[]>} - The retrieved training-toolboxs.
 * @throws {Error} - Throws an error if the training-toolboxs retrieval fails.
 */
export const getManyTrainingToolbox = catchAsync(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const query = {
    ...((req as any).validatedQuery as SearchQueryInput),
    requesterId: authReq.user?._id,
    requesterRole: authReq.user?.role,
  } as any;

  if (authReq.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = authReq.user._id;
  }

  const { trainingToolboxs, totalData, totalPages } =
    await trainingToolboxServices.getManyTrainingToolbox(query);
  if (!trainingToolboxs) throw new Error('Failed to retrieve training-toolboxs');
  ServerResponse(res, true, 200, 'Training-toolboxs retrieved successfully', {
    trainingToolboxs,
    totalData,
    totalPages,
  });
});
