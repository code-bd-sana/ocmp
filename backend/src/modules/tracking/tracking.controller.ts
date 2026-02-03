import { Request, Response } from 'express';
import { trackingServices } from './tracking.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single Tracking.
 *
 * @param {Request} req - The request object containing tracking data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>>} - The created tracking.
 * @throws {Error} - Throws an error if the tracking creation fails.
 */
export const createTracking = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new tracking and get the result
  const result = await trackingServices.createTracking(req.body);
  if (!result) throw new Error('Failed to create tracking');
  // Send a success response with the created tracking data
  ServerResponse(res, true, 201, 'Tracking created successfully', result);
});

/**
 * Controller function to handle the creation of multiple trackings.
 *
 * @param {Request} req - The request object containing an array of tracking data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>[]>} - The created trackings.
 * @throws {Error} - Throws an error if the trackings creation fails.
 */
export const createManyTracking = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple trackings and get the result
  const result = await trackingServices.createManyTracking(req.body);
  if (!result) throw new Error('Failed to create multiple trackings');
  // Send a success response with the created trackings data
  ServerResponse(res, true, 201, 'Trackings created successfully', result);
});

/**
 * Controller function to handle the update operation for a single tracking.
 *
 * @param {Request} req - The request object containing the ID of the tracking to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>>} - The updated tracking.
 * @throws {Error} - Throws an error if the tracking update fails.
 */
export const updateTracking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the tracking by ID and get the result
  const result = await trackingServices.updateTracking(id as string, req.body);
  if (!result) throw new Error('Failed to update tracking');
  // Send a success response with the updated tracking data
  ServerResponse(res, true, 200, 'Tracking updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple trackings.
 *
 * @param {Request} req - The request object containing an array of tracking data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>[]>} - The updated trackings.
 * @throws {Error} - Throws an error if the trackings update fails.
 */
export const updateManyTracking = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple trackings and get the result
  const result = await trackingServices.updateManyTracking(req.body);
  if (!result.length) throw new Error('Failed to update multiple trackings');
  // Send a success response with the updated trackings data
  ServerResponse(res, true, 200, 'Trackings updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single tracking.
 *
 * @param {Request} req - The request object containing the ID of the tracking to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>>} - The deleted tracking.
 * @throws {Error} - Throws an error if the tracking deletion fails.
 */
export const deleteTracking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the tracking by ID
  const result = await trackingServices.deleteTracking(id as string);
  if (!result) throw new Error('Failed to delete tracking');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Tracking deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple trackings.
 *
 * @param {Request} req - The request object containing an array of IDs of tracking to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>[]>} - The deleted trackings.
 * @throws {Error} - Throws an error if the tracking deletion fails.
 */
export const deleteManyTracking = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple trackings and get the result
  const result = await trackingServices.deleteManyTracking(req.body);
  if (!result) throw new Error('Failed to delete multiple trackings');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Trackings deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single tracking by ID.
 *
 * @param {Request} req - The request object containing the ID of the tracking to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>>} - The retrieved tracking.
 * @throws {Error} - Throws an error if the tracking retrieval fails.
 */
export const getTrackingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the tracking by ID and get the result
  const result = await trackingServices.getTrackingById(id as string);
  if (!result) throw new Error('Tracking not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Tracking retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple trackings.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITracking>[]>} - The retrieved trackings.
 * @throws {Error} - Throws an error if the trackings retrieval fails.
 */
export const getManyTracking = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters 
  const query = req.query as SearchQueryInput;
  // Call the service method to get multiple trackings based on query parameters and get the result
  const { trackings, totalData, totalPages } = await trackingServices.getManyTracking(query);
  if (!trackings) throw new Error('Failed to retrieve trackings');
  // Send a success response with the retrieved trackings data
  ServerResponse(res, true, 200, 'Trackings retrieved successfully', { trackings, totalData, totalPages });
});