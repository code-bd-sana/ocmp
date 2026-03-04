import { Request, Response } from 'express';
import { plannerServices } from './planner.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { UserRole } from '../../models';
import { UpdatePlannerAsManagerInput } from './planner.validation';

/**
 *
 * Controller function to handle the creation of a new planner as Transport Manager
 * @param {Request} req - The request object containing planner data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>>} - The created planner.
 * @throws {Error} - Throws an error if the planner creation fails.
 */
export const createPlannerAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    // Call the service method to create a new planner as Transport Manager and get the result
    const result = await plannerServices.createPlannerAsManager(req.body);
    if (!result) throw new Error('Failed to create planner');
    // Send a success response with the created planner data
    ServerResponse(res, true, 201, 'Planner created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a new planner as Standalone User
 *
 * @param {Request} req - The request object containing planner data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>>} - The created planner.
 * @throws {Error} - Throws an error if the planner creation fails.
 */
export const createPlannerAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new planner as Standalone User and get the result
    const result = await plannerServices.createPlannerAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create planner');
    // Send a success response with the created planner data
    ServerResponse(res, true, 201, 'Planner created successfully', result);
  }
);

/**
 * Controller function to handle the request for changing the planner date.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing the planner ID in URL parameters and the new date in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - Throws an error if the request for changing the planner date fails.
 */
export const requestChangePlannerDate = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    // Call the service method to request a change in planner date and get the result
    const result = await plannerServices.requestChangePlannerDate(id as string, req.user, req.body);
    if (!result) throw new Error('Failed to request change in planner date');
    // Send a success response confirming the request
    ServerResponse(res, true, 200, 'Change in planner date requested successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single planner.
 *
 * @param {Request} req - The request object containing the ID of the planner to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>>} - The updated planner.
 * @throws {Error} - Throws an error if the planner update fails.
 */
export const updatePlanner = catchAsync(async (req: Request, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);

  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  if (!id) {
    throw new Error('Planner ID is required');
  }

  const result = await plannerServices.updatePlanner(
    id,
    req.body as UpdatePlannerAsManagerInput,
    standAloneId
  );

  ServerResponse(res, true, 200, 'Planner updated successfully', result);
});

/**
 * Controller function to handle the update operation for a single planner as Standalone User.
 *
 * @param {Request} req - The request object containing the ID of the planner to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>>} - The updated planner.
 * @throws {Error} - Throws an error if the planner update fails.
 */
export const updatePlannerAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);

    const id = paramToString(req.params.id);

    // Call the service method to update the planner as Standalone User and get the result
    const result = await plannerServices.updatePlannerAsStandAlone(
      id,
      req.body as UpdatePlannerAsManagerInput,
      req.user!
    );
    ServerResponse(res, true, 200, 'Planner updated successfully', result);
  }
);

/**
 * Controller function to handle the deletion of a single planner.
 *
 * @param {Request} req - The request object containing the ID of the planner to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>>} - The deleted planner.
 * @throws {Error} - Throws an error if the planner deletion fails.
 */
export const deletePlanner = catchAsync(async (req: Request, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const standAloneId = paramToString((req.params as any).standAloneId);

  // Call the service method to delete the planner by ID
  const result = await plannerServices.deletePlanner(id as string, standAloneId as string);
  if (!result) throw new Error('Planner not found or you do not have permission to delete it');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Planner deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single planner by ID.
 *
 * @param {Request} req - The request object containing the ID of the planner to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>>} - The retrieved planner.
 * @throws {Error} - Throws an error if the planner retrieval fails.
 */
export const getPlannerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the planner by ID and get the result
  const result = await plannerServices.getPlannerById(id as string);
  if (!result) throw new Error('Planner not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Planner retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple planners.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPlanner>[]>} - The retrieved planners.
 * @throws {Error} - Throws an error if the planners retrieval fails.
 */
export const getManyPlanner = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = { ...(req as any).validatedQuery } as SearchQueryInput & { standAloneId?: string };

  if (req.user!.role === UserRole.STANDALONE_USER) {
    query.standAloneId = String(req.user!._id);
  }

  // Call the service method to get multiple planners based on query parameters and get the result
  const { planners, totalData, totalPages } = await plannerServices.getManyPlanner(query);
  if (!planners) throw new Error('Failed to retrieve planners');
  // Send a success response with the retrieved planners data
  ServerResponse(res, true, 200, 'Planners retrieved successfully', {
    planners,
    totalData,
    totalPages,
  });
});

/**
 * Controller function to handle the retrieval of all requested planners for a standalone user.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing the standalone user ID in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - Throws an error if the retrieval of requested planners fails.
 */
export const getAllRequestedPlanners = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const standAloneId = paramToString((req.params as any).standAloneId);
    // Call the service method to get all requested planners and get the result
    const result = await plannerServices.getAllRequestedPlanners(req.user!, standAloneId as string);
    if (!result) throw new Error('Failed to retrieve requested planners');
    // Send a success response with the retrieved requested planners data
    ServerResponse(res, true, 200, 'Requested planners retrieved successfully', result);
  }
);

/**
 * Controller function to handle the approval of a planner change request.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing the planner change request ID in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - Throws an error if the approval of the planner change request fails.
 */
export const approvalForPlannerChangesRequest = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    // Call the service method to approve the planner change request and get the result
    const result = await plannerServices.approvalForPlannerChangesRequest(id as string, req.user!);
    if (!result) throw new Error('Failed to approve planner change request');
    // Send a success response confirming the approval
    ServerResponse(res, true, 200, 'Planner change request approved successfully', result);
  }
);

/**
 * Controller function to handle the rejection of a planner change request.
 *
 * @param {AuthenticatedRequest} req - The authenticated request object containing the planner change request ID in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 * @throws {Error} - Throws an error if the rejection of the planner change request fails.
 */
export const rejectPlannerChangeRequest = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    // Call the service method to reject the planner change request and get the result
    const result = await plannerServices.rejectPlannerChangeRequest(id as string, req.user!);
    if (!result) throw new Error('Failed to reject planner change request');
    // Send a success response confirming the rejection
    ServerResponse(res, true, 200, 'Planner change request rejected successfully', result);
  }
);

