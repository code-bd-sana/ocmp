import { Response } from 'express';
import { maintenanceProviderCommunicationServices } from './maintenance-provider-communication.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { UserRole } from '../../models';
import { SearchMaintenanceProviderCommunicationQueryInput } from './maintenance-provider-communication.validation';

/**
 * Controller function to handle the creation of a single maintenance-provider-communication.
 *
 * @param {AuthenticatedRequest} req - The request object containing maintenance-provider-communication data in the body.
 * @param {AuthenticatedRequest} res - The response object used to send the response.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The created maintenance-provider-communication.
 * @throws {Error} - Throws an error if the maintenance-provider-communication creation fails.
 */
export const createMaintenanceProviderCommunicationAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new maintenance-provider-communication and get the result
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // require and normalize standAloneId (employer/client)
    const providedStandAloneId = req.body.standAloneId;
    if (!providedStandAloneId) throw new Error('standAloneId is required');
    req.body.standAloneId = new mongoose.Types.ObjectId(providedStandAloneId);
    const result =
      await maintenanceProviderCommunicationServices.createMaintenanceProviderCommunication(
        req.body
      );
    if (!result) throw new Error('Failed to create maintenance-provider-communication');
    // Send a success response with the created maintenance-provider-communication data
    ServerResponse(
      res,
      true,
      201,
      'Maintenance-provider-communication created successfully',
      result
    );
  }
);

/**
 * Controller function to handle the creation of a single maintenance-provider-communication.
 *
 * @param {AuthenticatedRequest} req - The request object containing maintenance-provider-communication data in the body.
 * @param {AuthenticatedRequest} res - The response object used to send the response.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The created maintenance-provider-communication.
 * @throws {Error} - Throws an error if the maintenance-provider-communication creation fails.
 */
export const createMaintenanceProviderCommunicationAsStandalone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new maintenance-provider-communication and get the result
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(userId);
    const result =
      await maintenanceProviderCommunicationServices.createMaintenanceProviderCommunication(
        req.body
      );
    if (!result) throw new Error('Failed to create maintenance-provider-communication');
    // Send a success response with the created maintenance-provider-communication data
    ServerResponse(
      res,
      true,
      201,
      'Maintenance-provider-communication created successfully',
      result
    );
  }
);

/**
 * Controller function to handle the update operation for a single maintenance-provider-communication.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the maintenance-provider-communication to update in URL parameters and the updated data in the body.
 * @param {AuthenticatedRequest} res - The response object used to send the response.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The updated maintenance-provider-communication.
 * @throws {Error} - Throws an error if the maintenance-provider-communication update fails.
 */
export const updateMaintenanceProviderCommunication = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params?.id);
    const standAloneId = paramToString(req.params?.standAloneId);
    // Call the service method to update the maintenance-provider-communication by ID and get the result
    const result =
      await maintenanceProviderCommunicationServices.updateMaintenanceProviderCommunication(
        id as string,
        req.body,
        req.user!._id,
        standAloneId
      );
    if (!result) {
      return ServerResponse(
        res,
        false,
        404,
        'Maintenance-provider-communication not found or you do not have permission to update it'
      );
    }
    // Send a success response with the updated maintenance-provider-communication data
    ServerResponse(
      res,
      true,
      200,
      'Maintenance-provider-communication updated successfully',
      result
    );
  }
);

/**
 * Controller function to handle the deletion of a single maintenance-provider-communication.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the maintenance-provider-communication to delete in URL parameters.
 * @param {AuthenticatedRequest} res - The response object used to send the response.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The deleted maintenance-provider-communication.
 * @throws {Error} - Throws an error if the maintenance-provider-communication deletion fails.
 */
export const deleteMaintenanceProviderCommunication = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString(req.params?.standAloneId);
    // Call the service method to delete the maintenance-provider-communication by ID
    const result =
      await maintenanceProviderCommunicationServices.deleteMaintenanceProviderCommunication(
        id as string,
        req.user!._id,
        standAloneId
      );
    if (!result) {
      return ServerResponse(
        res,
        false,
        404,
        'Maintenance-provider-communication not found or you do not have permission to delete it'
      );
    }
    // Send a success response confirming the deletion
    ServerResponse(res, true, 200, 'Maintenance-provider-communication deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single maintenance-provider-communication by ID.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the maintenance-provider-communication to retrieve in URL parameters.
 * @param {AuthenticatedRequest} res - The response object used to send the response.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The retrieved maintenance-provider-communication.
 * @throws {Error} - Throws an error if the maintenance-provider-communication retrieval fails.
 */
export const getMaintenanceProviderCommunicationById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const { id } = req.params;
    let standAloneId: string | undefined;
    let createdBy: string | undefined;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      standAloneId = req.user._id;
    }
    if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
      createdBy = req.user._id;
      standAloneId = paramToString(req.params?.standAloneId);
    }
    // Call the service method to get the maintenance-provider-communication by ID and get the result
    const result =
      await maintenanceProviderCommunicationServices.getMaintenanceProviderCommunicationById(
        id as string,
        standAloneId,
        createdBy
      );
    if (!result) throw new Error('Maintenance-provider-communication not found');
    // Send a success response with the retrieved resource data
    ServerResponse(
      res,
      true,
      200,
      'Maintenance-provider-communication retrieved successfully',
      result
    );
  }
);

/**
 * Controller function to handle the retrieval of multiple maintenance-provider-communications.
 *
 * @param {AuthenticatedRequest} req - The request object containing query parameters for filtering.
 * @param {AuthenticatedRequest} res - The response object used to send the response.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>[]>} - The retrieved maintenance-provider-communications.
 * @throws {Error} - Throws an error if the maintenance-provider-communications retrieval fails.
 */
export const getAllMaintenanceProviderCommunication = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    type maintenanceProviderCommunicationSearchQuery =
      SearchMaintenanceProviderCommunicationQueryInput & {
        createdBy?: string;
      };
    const query: maintenanceProviderCommunicationSearchQuery = {
      ...((req as any).validatedQuery as SearchMaintenanceProviderCommunicationQueryInput),
    };

    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.standAloneId = req.user._id;
    }

    if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
      query.createdBy = req.user._id;
      query.standAloneId = (req as any).validatedQuery.standAloneId;
    }
    // Call the service method to get multiple maintenance-provider-communications based on query parameters and get the result
    const { maintenanceProviderCommunications, totalData, totalPages } =
      await maintenanceProviderCommunicationServices.getAllMaintenanceProviderCommunication(query);
    if (!maintenanceProviderCommunications)
      throw new Error('Failed to retrieve maintenance-provider-communications');
    // Send a success response with the retrieved maintenance-provider-communications data
    ServerResponse(res, true, 200, 'Maintenance-provider-communications retrieved successfully', {
      maintenanceProviderCommunications,
      totalData,
      totalPages,
    });
  }
);

