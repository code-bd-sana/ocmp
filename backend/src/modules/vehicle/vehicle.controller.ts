import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import catchAsync from '../../utils/catch-async/catch-async';
import { vehicleServices } from './vehicle.service';
import { SearchVehicleQueryInput } from './vehicle.validation';

/**
 * Controller function to handle the creation of a new vehicle as a transport manager.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing the vehicle data in the body and user information.
 * @param {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - Throws an error if the vehicle creation fails or if required fields are missing/invalid.
 */
export const createVehicleAsTransportManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // require and normalize standAloneId (employer/client)
    const providedStandAloneId = req.body.standAloneId;
    if (!providedStandAloneId) throw new Error('standAloneId is required');
    req.body.standAloneId = new mongoose.Types.ObjectId(providedStandAloneId);

    const result = await vehicleServices.createVehicle(req.body);
    if (!result) throw new Error('Failed to create vehicle');
    ServerResponse(res, true, 201, 'Vehicle created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a new vehicle as a stand-alone user.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing the vehicle data in the body and user information.
 * @param {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - Throws an error if the vehicle creation fails or if required fields are missing/invalid.
 */
export const createVehicleAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await vehicleServices.createVehicle(req.body);
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
export const updateVehicle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const vehicleId = paramToString(req.params.vehicleId ?? req.params.id);
  const standAloneId = paramToString(req.params.standAloneId);
  // Call the service method to update the vehicle by ID and get the result
  const result = await vehicleServices.updateVehicle(
    vehicleId as string,
    req.body,
    req.user!._id,
    standAloneId
  );
  if (!result) {
    return ServerResponse(res, false, 404, 'Vehicle not found or access denied');
  }
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
export const getVehicleById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const { id } = req.params;
  let standAloneId: string | undefined;
  let createdBy: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    standAloneId = req.user._id;
  }

  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    createdBy = req.user._id;
    standAloneId = paramToString(req.params.standAloneId);
  }

  // Call the service method to get the vehicle by ID and get the result
  const result = await vehicleServices.getVehicleById(id as string, standAloneId, createdBy);
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
export const getManyVehicle = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  type VehicleSearchQuery = SearchVehicleQueryInput & { createdBy?: string };
  const query: VehicleSearchQuery = {
    ...((req as any).validatedQuery as SearchVehicleQueryInput),
  };

  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }

  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    query.createdBy = req.user._id;
    query.standAloneId = (req as any).validatedQuery.standAloneId;
  }
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
