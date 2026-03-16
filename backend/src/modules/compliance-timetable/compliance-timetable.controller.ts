import { Request, Response } from 'express';
import { complianceTimetableServices } from './compliance-timetable.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchComplianceTimetableQueryInput } from './compliance-timetable.validation';
import mongoose from 'mongoose';

/**
 * Controller function to handle the creation of a single compliance-timetable.
 *
 * @param {Request} req - The request object containing compliance-timetable data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IComplianceTimetable>>} - The created compliance-timetable.
 * @throws {Error} - Throws an error if the compliance-timetable creation fails.
 ** Transport Manager: require standAloneId in body and validate that it belongs to the TM's client(s)
 */
export const createComplianceTimetableAsTransportManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // require and normalize standAloneId (employer/client)
    const providedStandAloneId = req.body.standAloneId;
    if (!providedStandAloneId) throw new Error('standAloneId is required');
    req.body.standAloneId = new mongoose.Types.ObjectId(providedStandAloneId);

    const result = await complianceTimetableServices.createComplianceTimetable(req.body);
    if (!result) throw new Error('Failed to create compliance-timetable');
    ServerResponse(res, true, 201, 'Compliance-timetable created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a single compliance-timetable.
 *
 * @param {Request} req - The request object containing compliance-timetable data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IComplianceTimetable>>} - The created compliance-timetable.
 * @throws {Error} - Throws an error if the compliance-timetable creation fails.
 ** Standalone user: no need for standAloneId in body as it will be taken from user info
 */
export const createComplianceTimetableAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await complianceTimetableServices.createComplianceTimetable(req.body);
    if (!result) throw new Error('Failed to create compliance-timetable');
    ServerResponse(res, true, 201, 'Compliance-timetable created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single compliance-timetable.
 *
 * @param {Request} req - The request object containing the ID of the compliance-timetable to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IComplianceTimetable>>} - The updated compliance-timetable.
 * @throws {Error} - Throws an error if the compliance-timetable update fails.
 */
export const updateComplianceTimetable = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params?.id);
    const accessId =
      req.user!.role === UserRole.TRANSPORT_MANAGER
        ? (paramToString(req.params?.standAloneId) as string)
        : req.user!._id;
    // Call the service method to update the compliance-timetable by ID and get the result
    const result = await complianceTimetableServices.updateComplianceTimetable(
      id as string,
      req.body,
      accessId
    );
    // Send a success response with the updated compliance-timetable data
    ServerResponse(res, true, 200, 'Compliance-timetable updated successfully', result);
  }
);

/**
 * Controller function to handle the deletion of a single compliance-timetable.
 *
 * @param {Request} req - The request object containing the ID of the compliance-timetable to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IComplianceTimetable>>} - The deleted compliance-timetable.
 * @throws {Error} - Throws an error if the compliance-timetable deletion fails.
 */
export const deleteComplianceTimetable = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const accessId =
      req.user!.role === UserRole.TRANSPORT_MANAGER
        ? (paramToString(req.params.standAloneId) as string)
        : req.user!._id;
    // Call the service method to delete the compliance-timetable by ID
    await complianceTimetableServices.deleteComplianceTimetable(id as string, accessId);
    // Send a success response confirming the deletion
    ServerResponse(res, true, 200, 'Compliance-timetable deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single compliance-timetable by ID.
 *
 * @param {Request} req - The request object containing the ID of the compliance-timetable to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IComplianceTimetable>>} - The retrieved compliance-timetable.
 * @throws {Error} - Throws an error if the compliance-timetable retrieval fails.
 */
export const getComplianceTimetableById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const { id } = req.params;
    let accessId: string | undefined;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      accessId = req.user._id;
    }
    if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
      accessId = paramToString(req.params?.standAloneId);
    }
    // Call the service method to get the compliance-timetable by ID and get the result
    const result = await complianceTimetableServices.getComplianceTimetableById(id as string, accessId);
    if (!result) throw new Error('Compliance-timetable not found');
    // Send a success response with the retrieved resource data
    ServerResponse(res, true, 200, 'Compliance-timetable retrieved successfully', result);
  }
);

/**
 * Controller function to handle the retrieval of multiple compliance-timetables.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IComplianceTimetable>[]>} - The retrieved compliance-timetables.
 * @throws {Error} - Throws an error if the compliance-timetables retrieval fails.
 */
export const getAllComplianceTimetable = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the validated and transformed query from Zod middleware
    const query: SearchComplianceTimetableQueryInput = {
      ...((req as any).validatedQuery as SearchComplianceTimetableQueryInput),
    };
    
    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.standAloneId = req.user._id;
    }

    if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
      query.standAloneId = (req as any).validatedQuery.standAloneId;
    }

    // Call the service method to get multiple compliance-timetables based on query parameters and get the result
    const { complianceTimetables, totalData, totalPages } = await complianceTimetableServices.getAllComplianceTimetable(query);
    if (!complianceTimetables) throw new Error('Failed to retrieve compliance-timetables');
    // Send a success response with the retrieved complianceTimetables data
    ServerResponse(res, true, 200, 'Compliance-timetables retrieved successfully', {
      complianceTimetables,
      totalData,
      totalPages,
    });
  }
);

