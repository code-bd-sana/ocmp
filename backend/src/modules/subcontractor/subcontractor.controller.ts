import { Request, Response } from 'express';
import { subcontractorServices } from './subcontractor.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';

/**
 * Controller function to handle the creation of a single subcontractor.
 *
 * @param {Request} req - The request object containing subcontractor data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>>} - The created subcontractor.
 * @throws {Error} - Throws an error if the subcontractor creation fails.
 */
export const createSubcontractor = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);

  const result = await subcontractorServices.createSubcontractor(req.body);
  if (!result) throw new Error('Failed to create subcontractor');
  // Send a success response with the created subcontractor data
  ServerResponse(res, true, 201, 'Subcontractor created successfully', result);
});

/**
 * Controller function to handle the update operation for a single subcontractor.
 *
 * @param {Request} req - The request object containing the ID of the subcontractor to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>>} - The updated subcontractor.
 * @throws {Error} - Throws an error if the subcontractor update fails.
 */
export const updateSubcontractor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the subcontractor by ID and get the result
  const result = await subcontractorServices.updateSubcontractor(id as string, req.body);
  if (!result) throw new Error('Failed to update subcontractor');
  // Send a success response with the updated subcontractor data
  ServerResponse(res, true, 200, 'Subcontractor updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple subcontractors.
 *
 * @param {Request} req - The request object containing an array of subcontractor data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>[]>} - The updated subcontractors.
 * @throws {Error} - Throws an error if the subcontractors update fails.
 */
export const updateManySubcontractor = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple subcontractors and get the result
  const result = await subcontractorServices.updateManySubcontractor(req.body);
  if (!result.length) throw new Error('Failed to update multiple subcontractors');
  // Send a success response with the updated subcontractors data
  ServerResponse(res, true, 200, 'Subcontractors updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single subcontractor.
 *
 * @param {Request} req - The request object containing the ID of the subcontractor to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>>} - The deleted subcontractor.
 * @throws {Error} - Throws an error if the subcontractor deletion fails.
 */
export const deleteSubcontractor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the subcontractor by ID
  const result = await subcontractorServices.deleteSubcontractor(id as string);
  if (!result) throw new Error('Failed to delete subcontractor');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Subcontractor deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple subcontractors.
 *
 * @param {Request} req - The request object containing an array of IDs of subcontractor to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>[]>} - The deleted subcontractors.
 * @throws {Error} - Throws an error if the subcontractor deletion fails.
 */
export const deleteManySubcontractor = catchAsync(async (req: Request, res: Response) => {
  // Extract ids from request body
  const { ids } = req.body;
  // Call the service method to delete multiple subcontractors and get the result
  const result = await subcontractorServices.deleteManySubcontractor(ids);
  if (!result) throw new Error('Failed to delete multiple subcontractors');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Subcontractors deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single subcontractor by ID.
 *
 * @param {Request} req - The request object containing the ID of the subcontractor to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>>} - The retrieved subcontractor.
 * @throws {Error} - Throws an error if the subcontractor retrieval fails.
 */
export const getSubcontractorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the subcontractor by ID and get the result
  const result = await subcontractorServices.getSubcontractorById(id as string);
  if (!result) throw new Error('Subcontractor not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Subcontractor retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple subcontractors.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ISubcontractor>[]>} - The retrieved subcontractors.
 * @throws {Error} - Throws an error if the subcontractors retrieval fails.
 */
export const getManySubcontractor = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple subcontractors based on query parameters and get the result
  const { subcontractors, totalData, totalPages } =
    await subcontractorServices.getManySubcontractor(query);
  if (!subcontractors) throw new Error('Failed to retrieve subcontractors');
  // Send a success response with the retrieved subcontractors data
  ServerResponse(res, true, 200, 'Subcontractors retrieved successfully', {
    subcontractors,
    totalData,
    totalPages,
  });
});
