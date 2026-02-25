import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { spotCheckServices } from './spot-check.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';

/**
 * Controller function to handle the creation of a single spot-check.
 *
 * @param {Request} req - The request object containing spot-check data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISpotCheck>>} - The created spot-check.
 * @throws {Error} - Throws an error if the spot-check creation fails.
 */
export const createSpotCheckAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // ensure standAloneId is converted to ObjectId
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    const result = await spotCheckServices.createSpotCheckAsManager(req.body);
    if (!result) throw new Error('Failed to create spot-check');
    ServerResponse(res, true, 201, 'Spot-check created successfully', result);
  }
);

export const createSpotCheckAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // reportedBy should default to the authenticated user if not provided
    if (!req.body.reportedBy) req.body.reportedBy = new mongoose.Types.ObjectId(userId);
    const result = await spotCheckServices.createSpotCheckAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create spot-check');
    ServerResponse(res, true, 201, 'Spot-check created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single spot-check.
 *
 * @param {Request} req - The request object containing the ID of the spot-check to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISpotCheck>>} - The updated spot-check.
 * @throws {Error} - Throws an error if the spot-check update fails.
 */
export const updateSpotCheck = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the spot-check by ID and get the result
  const result = await spotCheckServices.updateSpotCheck(id as string, req.body);
  if (!result) throw new Error('Failed to update spot-check');
  // Send a success response with the updated spot-check data
  ServerResponse(res, true, 200, 'Spot-check updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single spot-check.
 *
 * @param {Request} req - The request object containing the ID of the spot-check to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISpotCheck>>} - The deleted spot-check.
 * @throws {Error} - Throws an error if the spot-check deletion fails.
 */
export const deleteSpotCheck = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the spot-check by ID
  const result = await spotCheckServices.deleteSpotCheck(id as string);
  if (!result) throw new Error('Failed to delete spot-check');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Spot-check deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single spot-check by ID.
 *
 * @param {Request} req - The request object containing the ID of the spot-check to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISpotCheck>>} - The retrieved spot-check.
 * @throws {Error} - Throws an error if the spot-check retrieval fails.
 */
export const getSpotCheckById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the spot-check by ID and get the result
  const result = await spotCheckServices.getSpotCheckById(id as string);
  if (!result) throw new Error('Spot-check not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Spot-check retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple spot-checks.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISpotCheck>[]>} - The retrieved spot-checks.
 * @throws {Error} - Throws an error if the spot-checks retrieval fails.
 */
export const getManySpotCheck = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple spot-checks based on query parameters and get the result
  const { spotChecks, totalData, totalPages } = await spotCheckServices.getManySpotCheck(query);
  if (!spotChecks) throw new Error('Failed to retrieve spot-checks');
  // Send a success response with the retrieved spot-checks data
  ServerResponse(res, true, 200, 'Spot-checks retrieved successfully', {
    spotChecks,
    totalData,
    totalPages,
  });
});

