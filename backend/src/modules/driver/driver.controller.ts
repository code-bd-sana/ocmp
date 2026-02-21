import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { driverServices } from './driver.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a driver by a transport manager.
 *
 * @param {Request} req - The request object containing driver data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 * @throws {Error} - Throws an error if the driver creation fails.
 */
export const createDriverAsTransportManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new driver and get the result
    const result = await driverServices.createDriverAsTransportManager(req.body, userId);
    if (!result) throw new Error('Failed to create driver');
    // Send a success response with the created driver data
    ServerResponse(res, true, 201, 'Driver created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a stand-alone driver.
 *
 * @param {Request} req - The request object containing driver data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 * @throws {Error} - Throws an error if the driver creation fails.
 */
export const createDriverAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new stand-alone driver and get the result
    const result = await driverServices.createDriverAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create stand-alone driver');
    // Send a success response with the created driver data
    ServerResponse(res, true, 201, 'Driver created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single driver.
 *
 * @param {Request} req - The request object containing the ID of the driver to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriver>>} - The updated driver.
 * @throws {Error} - Throws an error if the driver update fails.
 */
export const updateDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the driver by ID and get the result
  const result = await driverServices.updateDriver(id as string, req.body);
  if (!result) throw new Error('Failed to update driver');
  // Send a success response with the updated driver data
  ServerResponse(res, true, 200, 'Driver updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single driver.
 *
 * @param {Request} req - The request object containing the ID of the driver to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriver>>} - The deleted driver.
 * @throws {Error} - Throws an error if the driver deletion fails.
 */
export const deleteDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the driver by ID
  const result = await driverServices.deleteDriver(id as string);
  if (!result) throw new Error('Failed to delete driver');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Driver deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single driver by ID.
 *
 * @param {Request} req - The request object containing the ID of the driver to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriver>>} - The retrieved driver.
 * @throws {Error} - Throws an error if the driver retrieval fails.
 */
export const getDriverById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the driver by ID and get the result
  const result = await driverServices.getDriverById(id as string);
  if (!result) throw new Error('Driver not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Driver retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple drivers.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IDriver>[]>} - The retrieved drivers.
 * @throws {Error} - Throws an error if the drivers retrieval fails.
 */
export const getManyDriver = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple drivers based on query parameters and get the result
  const { drivers, totalData, totalPages } = await driverServices.getManyDriver(query);
  if (!drivers) throw new Error('Failed to retrieve drivers');
  // Send a success response with the retrieved drivers data
  ServerResponse(res, true, 200, 'Drivers retrieved successfully', {
    drivers,
    totalData,
    totalPages,
  });
});

