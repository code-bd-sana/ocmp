import { Request, Response } from 'express';
import { selfServiceServices } from './self-service.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { UserRole } from '../../models';

/**
 * Create a new self-service as a transport manager.
 *
 * @param {Request} req - The request object containing self-service data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISelfService>>} - The created self-service.
 */
export const createSelfServiceAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    // Call the service method to create a new self-service as a transport manager and get the result
    const result = await selfServiceServices.createSelfServiceAsManager(req.body);
    if (!result) throw new Error('Failed to create self-service');
    // Send a success response with the created self-service data
    ServerResponse(res, true, 201, 'Self-service created successfully', result);
  }
);

/**
 * Create a new self-service as a stand-alone user.
 *
 * @param {Request} req - The request object containing self-service data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISelfService>>} - The created self-service.
 */
export const createSelfServiceAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new self-service as a stand-alone user and get the result
    const result = await selfServiceServices.createSelfServiceAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create self-service');
    // Send a success response with the created self-service data
    ServerResponse(res, true, 201, 'Self-service created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single self-service.
 *
 * @param {Request} req - The request object containing the ID of the self-service to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISelfService>>} - The updated self-service.
 * @throws {Error} - Throws an error if the self-service update fails.
 */
export const updateSelfService = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  // Call the service method to update the self-service by ID and get the result
  const result = await selfServiceServices.updateSelfService(
    id as string,
    req.body,
    req.user!._id,
    standAloneId
  );
  if (!result) throw new Error('Self service not found or you do not have permission to update it');
  // Send a success response with the updated self-service data
  ServerResponse(res, true, 200, 'Self-service updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single self-service.
 *
 * @param {Request} req - The request object containing the ID of the self-service to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISelfService>>} - The deleted self-service.
 * @throws {Error} - Throws an error if the self-service deletion fails.
 */
export const deleteSelfService = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  // Call the service method to delete the self-service by ID
  const result = await selfServiceServices.deleteSelfService(
    id as string,
    req.user!._id,
    standAloneId
  );
  if (!result) throw new Error('Self service not found or you do not have permission to delete it');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Self-service deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single self-service by ID.
 *
 * @param {Request} req - The request object containing the ID of the self-service to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISelfService>>} - The retrieved self-service.
 * @throws {Error} - Throws an error if the self-service retrieval fails.
 */
export const getSelfServiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the self-service by ID and get the result
  const result = await selfServiceServices.getSelfServiceById(id as string);
  if (!result) throw new Error('Self-service not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Self-service retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple self-services.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISelfService>[]>} - The retrieved self-services.
 * @throws {Error} - Throws an error if the self-services retrieval fails.
 */
export const getManySelfService = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = { ...(req as any).validatedQuery } as SearchQueryInput & { standAloneId?: string };

  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = String(req.user._id);
  }
  // Call the service method to get multiple self-services based on query parameters and get the result
  const { selfServices, totalData, totalPages } =
    await selfServiceServices.getManySelfService(query);
  if (!selfServices) throw new Error('Failed to retrieve self-services');
  // Send a success response with the retrieved self-services data
  ServerResponse(res, true, 200, 'Self-services retrieved successfully', {
    selfServices,
    totalData,
    totalPages,
  });
});

