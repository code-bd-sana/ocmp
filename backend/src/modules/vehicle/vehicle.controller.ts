import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { vehicleServices } from './vehicle.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single vehicle.
 *
 * @param {Request} req - The request object containing vehicle data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IVehicle>>} - The created vehicle.
 * @throws {Error} - Throws an error if the vehicle creation fails.
 */
export const createVehicle = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new vehicle and get the result
  const result = await vehicleServices.createVehicle(req.body);
  if (!result) throw new Error('Failed to create vehicle');
  // Send a success response with the created vehicle data
  ServerResponse(res, true, 201, 'Vehicle created successfully', result);
});

export const createVehicleAsTransportManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // require and normalize standAloneId (employer/client)
    const providedStandAloneId = req.body.standAloneId;
    if (!providedStandAloneId) throw new Error('standAloneId is required');
    req.body.standAloneId = new mongoose.Types.ObjectId(providedStandAloneId);

    const result = await vehicleServices.createVehicleAsTransportManager(req.body, userId);
    if (!result) throw new Error('Failed to create vehicle');
    ServerResponse(res, true, 201, 'Vehicle created successfully', result);
  }
);

export const createVehicleAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // stand-alone user's `standAloneId` should be the user's own id
    req.body.standAloneId = new mongoose.Types.ObjectId(userId);
    const result = await vehicleServices.createVehicleAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create vehicle');
    ServerResponse(res, true, 201, 'Vehicle created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single vehicle.
 *
 * @param {Request} req - The request object containing the ID of the vehicle to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IVehicle>>} - The updated vehicle.
 * @throws {Error} - Throws an error if the vehicle update fails.
 */
export const updateVehicle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the vehicle by ID and get the result
  const result = await vehicleServices.updateVehicle(id as string, req.body);
  if (!result) throw new Error('Failed to update vehicle');
  // Send a success response with the updated vehicle data
  ServerResponse(res, true, 200, 'Vehicle updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single vehicle.
 *
 * @param {Request} req - The request object containing the ID of the vehicle to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IVehicle>>} - The deleted vehicle.
 * @throws {Error} - Throws an error if the vehicle deletion fails.
 *
 */
export const deleteVehicle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the vehicle by ID
  const result = await vehicleServices.deleteVehicle(id as string);
  if (!result) throw new Error('Failed to delete vehicle');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Vehicle deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single vehicle by ID.
 *
 * @param {Request} req - The request object containing the ID of the vehicle to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IVehicle>>} - The retrieved vehicle.
 * @throws {Error} - Throws an error if the vehicle retrieval fails.
 */
export const getVehicleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the vehicle by ID and get the result
  const result = await vehicleServices.getVehicleById(id as string);
  if (!result) throw new Error('Vehicle not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Vehicle retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple vehicles.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IVehicle>[]>} - The retrieved vehicles.
 * @throws {Error} - Throws an error if the vehicles retrieval fails.
 */
export const getManyVehicle = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple vehicles based on query parameters and get the result
  const { vehicles, totalData, totalPages } = await vehicleServices.getManyVehicle(query);
  if (!vehicles) throw new Error('Failed to retrieve vehicles');
  // Send a success response with the retrieved vehicles data
  ServerResponse(res, true, 200, 'Vehicles retrieved successfully', {
    vehicles,
    totalData,
    totalPages,
  });
});
