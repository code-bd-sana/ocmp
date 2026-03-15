import { Request, Response } from 'express';
import { contactLogServices } from './contact-log.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { UserRole } from '../../models';
import { SearchContactLogQueryInput } from './contact-log.validation';

/**
 * Controller function to handle the creation of a single contact-log.
 *
 * @param {AuthenticatedRequest} req - The request object containing contact-log data in the body.
 * @param {Response} res - The response object used to send the response.
 * @access Private (Transport Manager)
 * @returns {Promise<Partial<IContactLog>>} - The created contact-log.
 * @throws {Error} - Throws an error if the contact-log creation fails.
 */
export const createContactLogAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const providedStandAloneId = req.body.standAloneId;
    // require and normalize standAloneId (Transport Manger)
    if (!providedStandAloneId) throw new Error('standAloneId is required');
    req.body.standAloneId = new mongoose.Types.ObjectId(providedStandAloneId);
    // Call the service method to create a new contact-log and get the result
    const result = await contactLogServices.createContactLog(req.body);
    if (!result) throw new Error('Failed to create contact-log');
    // Send a success response with the created contact-log data
    ServerResponse(res, true, 201, 'Contact-log created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a single contact-log.
 *
 * @param {AuthenticatedRequest} req - The request object containing contact-log data in the body.
 * @param {Response} res - The response object used to send the response.
 * @access Private (Standalone User)
 * @returns {Promise<Partial<IContactLog>>} - The created contact-log.
 * @throws {Error} - Throws an error if the contact-log creation fails.
 */
export const createContactLogAsStandalone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // Call the service method to create a new contact-log and get the result
    const result = await contactLogServices.createContactLog(req.body);
    if (!result) throw new Error('Failed to create contact-log');
    // Send a success response with the created contact-log data
    ServerResponse(res, true, 201, 'Contact-log created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single contact-log.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the contact-log to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IContactLog>>} - The updated contact-log.
 * @throws {Error} - Throws an error if the contact-log update fails.
 */
export const updateContactLog = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params?.id);
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;
  // Call the service method to update the contact-log by ID and get the result
  const result = await contactLogServices.updateContactLog(
    id as string,
    req.body,
    accessId
  );

  // Send a success response with the updated contact-log data
  ServerResponse(res, true, 200, 'Contact-log updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single contact-log.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the contact-log to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IContactLog>>} - The deleted contact-log.
 * @throws {Error} - Throws an error if the contact-log deletion fails.
 */
export const deleteContactLog = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;
  // Call the service method to delete the contact-log by ID
  await contactLogServices.deleteContactLog(id as string, accessId);

  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Contact-log deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single contact-log by ID.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the contact-log to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IContactLog>>} - The retrieved contact-log.
 * @throws {Error} - Throws an error if the contact-log retrieval fails.
 */
export const getContactLogById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const { id } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = paramToString(req.params?.standAloneId);
  }
  // Call the service method to get the contact-log by ID and get the result
  const result = await contactLogServices.getContactLogById(id as string, accessId);
  if (!result) throw new Error('Contact-log not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Contact-log retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple contact-logs.
 *
 * @param {AuthenticatedRequest} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IContactLog>[]>} - The retrieved contact-logs.
 * @throws {Error} - Throws an error if the contact-logs retrieval fails.
 */
export const getManyContactLog = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  type contactLogSearchQuery = SearchContactLogQueryInput & {
    createdBy?: string;
  };
  const query: contactLogSearchQuery = {
    ...((req as any).validatedQuery as SearchContactLogQueryInput),
  };

  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = String(req.user._id);
  }

  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    query.standAloneId = (req as any).validatedQuery.standAloneId;
  }

  // Call the service method to get multiple contact-logs based on query parameters and get the result
  const { contactLogs, totalData, totalPages } = await contactLogServices.getManyContactLog(query);
  if (!contactLogs) throw new Error('Failed to retrieve contact-logs');
  // Send a success response with the retrieved contact-logs data
  ServerResponse(res, true, 200, 'Contact-logs retrieved successfully', {
    contactLogs,
    totalData,
    totalPages,
  });
});

