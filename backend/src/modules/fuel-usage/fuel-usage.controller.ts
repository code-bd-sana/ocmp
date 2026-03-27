import { Request, Response } from 'express';
import { fuelUsageServices } from './fuel-usage.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { SearchFuelUsageInput } from './fuel-usage.validation';
import { UserRole } from '../../models';

/**
 * Controller: Create a fuel-usage record as a Transport Manager
 */
export const createFuelUsageAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new fuel-usage and get the result

    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);

    const result = await fuelUsageServices.createFuelUsageAsManager(req.body);
    if (!result) throw new Error('Failed to create fuel-usage');
    // Send a success response with the created fuel-usage data
    ServerResponse(res, true, 201, 'Fuel-usage created successfully', result);
  }
);

/**
 * Controller: Create a fuel-usage record as a Standalone User
 */
export const createFuelUsageAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new fuel-usage and get the result

    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);

    const result = await fuelUsageServices.createFuelUsageAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create fuel-usage');
    // Send a success response with the created fuel-usage data
    ServerResponse(res, true, 201, 'Fuel-usage created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single fuel-usage.
 *
 * @param {Request} req - The request object containing the ID of the fuel-usage to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IFuelUsage>>} - The updated fuel-usage.
 * @throws {Error} - Throws an error if the fuel-usage update fails.
 */
export const updateFuelUsage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramRToString = (p?: string | string[]): string => (Array.isArray(p) ? p[0] : p || '');
  const id = paramRToString(req.params.id);

  // Transport manager through the client's standAloneId; standalone uses own Id
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramRToString(req.params.standAloneId) as string)
      : req.user!._id;

  // Call the service method to update the fuel-usage by ID and get the result
  const result = await fuelUsageServices.updateFuelUsage(id as string, req.body, accessId);
  if (!result) throw new Error('Failed to update fuel-usage');
  // Send a success response with the updated fuel-usage data
  ServerResponse(res, true, 200, 'Fuel-usage updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single fuel-usage.
 *
 * @param {Request} req - The request object containing the ID of the fuel-usage to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IFuelUsage>>} - The deleted fuel-usage.
 * @throws {Error} - Throws an error if the fuel-usage deletion fails.
 */
export const deleteFuelUsage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]): string => (Array.isArray(p) ? p[0] : p || '');
  const id = paramToString(req.params.id);

  // Transport manager through the client's standAloneId; standalone uses own Id
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;

  // Call the service method to delete the fuel-usage by ID
  const result = await fuelUsageServices.deleteFuelUsage(id as string, accessId);
  if (!result) throw new Error('Failed to delete fuel-usage');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Fuel-usage deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single fuel-usage by ID.
 *
 * @param {Request} req - The request object containing the ID of the fuel-usage to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IFuelUsage>>} - The retrieved fuel-usage.
 * @throws {Error} - Throws an error if the fuel-usage retrieval fails.
 */
export const getFuelUsageById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = req.params?.standAloneId as string;
  }

  // Call the service method to get the fuel-usage by ID and get the result
  const result = await fuelUsageServices.getFuelUsageById(id as string, accessId);
  if (!result) throw new Error('Fuel-usage not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Fuel-usage retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple fuel-usages.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IFuelUsage>[]>} - The retrieved fuel-usages.
 * @throws {Error} - Throws an error if the fuel-usages retrieval fails.
 */
export const getManyFuelUsage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = { ...((req as any).validatedQuery as SearchFuelUsageInput) };

  // StandAlone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }

  // Transport Manager: standAloneId already comes from validated query params

  // const result = await fuelUsageServices.getManyFuelUsage(query);

  // Call the service method to get multiple fuel-usages based on query parameters and get the result
  const { fuelUsages, totalData, totalPages } = await fuelUsageServices.getManyFuelUsage(query);
  if (!fuelUsages) throw new Error('Failed to retrieve fuel-usages');
  // Send a success response with the retrieved fuel-usages data
  ServerResponse(res, true, 200, 'Fuel-usages retrieved successfully', {
    fuelUsages,
    totalData,
    totalPages,
  });
});

/**
 * Controller: Get all drivers with their vehicle lists for fuel usage flows.
 * TM sends standAloneId as query param; Standalone uses own userId.
 * GET /api/v1/fuel-usage/get-drivers-with-vehicles
 */
export const getDriversWithVehicles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    let accessId: string;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      accessId = req.user._id;
    } else {
      accessId = req.query?.standAloneId as string;
    }

    const result = await fuelUsageServices.getDriversWithVehicles(accessId);
    ServerResponse(res, true, 200, 'Drivers with vehicles retrieved successfully', result);
  }
);
