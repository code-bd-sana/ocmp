import { Response } from 'express';
import { meetingNoteServices } from './meeting-note.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import mongoose from 'mongoose';
import { UserRole } from '../../models';
import { SearchMeetingNoteQueryInput } from './meeting-note.validation';

/**
 * Controller function to handle the creation of a single meeting-note.
 *
 * @param {AuthenticatedRequest} req - The request object containing meeting-note data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IMeetingNote>>} - The created meeting-note.
 * @throws {Error} - Throws an error if the meeting-note creation fails.
 */
export const createMeetingNoteAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new meeting-note and get the result
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    // require and normalize standAloneId (employer/client)
    const providedStandAloneId = req.body.standAloneId;
    if (!providedStandAloneId) throw new Error('standAloneId is required');
    req.body.standAloneId = new mongoose.Types.ObjectId(providedStandAloneId);
    const result = await meetingNoteServices.createMeetingNote(req.body);
    if (!result) throw new Error('Failed to create meeting-note');
    // Send a success response with the created meeting-note data
    ServerResponse(res, true, 201, 'Meeting-note created successfully', result);
  }
);

/**
 * Controller function to handle the creation of a single meeting-note.
 *
 * @param {AuthenticatedRequest} req - The request object containing meeting-note data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IMeetingNote>>} - The created meeting-note.
 * @throws {Error} - Throws an error if the meeting-note creation fails.
 */
export const createMeetingNoteAsStandalone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new meeting-note and get the result
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result = await meetingNoteServices.createMeetingNote(req.body);
    // return;
    if (!result) throw new Error('Failed to create meeting-note');
    // Send a success response with the created meeting-note data
    ServerResponse(res, true, 201, 'Meeting-note created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single meeting-note.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the meeting-note to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IMeetingNote>>} - The updated meeting-note.
 * @throws {Error} - Throws an error if the meeting-note update fails.
 */
export const updateMeetingNote = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params?.id);
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;
  // Call the service method to update the meeting-note by ID and get the result
  const result = await meetingNoteServices.updateMeetingNote(id as string, req.body, accessId);

  // Send a success response with the updated meeting-note data
  ServerResponse(res, true, 200, 'Meeting-note updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single meeting-note.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the meeting-note to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IMeetingNote>>} - The deleted meeting-note.
 * @throws {Error} - Throws an error if the meeting-note deletion fails.
 */
export const deleteMeetingNote = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const accessId =
    req.user!.role === UserRole.TRANSPORT_MANAGER
      ? (paramToString(req.params.standAloneId) as string)
      : req.user!._id;
  // Call the service method to delete the meeting-note by ID
  await meetingNoteServices.deleteMeetingNote(id as string, accessId);

  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Meeting-note deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single meeting-note by ID.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the meeting-note to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IMeetingNote>>} - The retrieved meeting-note.
 * @throws {Error} - Throws an error if the meeting-note retrieval fails.
 */
export const getMeetingNoteById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const { id } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = paramToString(req.params?.standAloneId);
  }
  // Call the service method to get the meeting-note by ID and get the result
  const result = await meetingNoteServices.getMeetingNoteById(id as string, accessId);
  if (!result) throw new Error('Meeting-note not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Meeting-note retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple meeting-notes.
 *
 * @param {AuthenticatedRequest} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IMeetingNote>[]>} - The retrieved meeting-notes.
 * @throws {Error} - Throws an error if the meeting-notes retrieval fails.
 */
export const getAllMeetingNote = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  type meetingNoteSearchQuery = SearchMeetingNoteQueryInput & {
    createdBy?: string;
  };
  const query: meetingNoteSearchQuery = {
    ...((req as any).validatedQuery as SearchMeetingNoteQueryInput),
  };

  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = String(req.user._id);
  }

  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    query.standAloneId = (req as any).validatedQuery.standAloneId;
  }

  // Call the service method to get multiple meeting-notes based on query parameters and get the result
  const { meetingNotes, totalData, totalPages } =
    await meetingNoteServices.getAllMeetingNote(query);
  if (!meetingNotes) throw new Error('Failed to retrieve meeting-notes');
  // Send a success response with the retrieved meeting-notes data
  ServerResponse(res, true, 200, 'Meeting-notes retrieved successfully', {
    meetingNotes,
    totalData,
    totalPages,
  });
});
