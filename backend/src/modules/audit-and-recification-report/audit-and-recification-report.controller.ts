import { Response } from 'express';
import { auditAndRecificationReportServices } from './audit-and-recification-report.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { SearchAuditAndRecificationReportsQueryInput } from './audit-and-recification-report.validation';
import { UserRole } from '../../models';
import mongoose from 'mongoose';
import {
  extractUploadedFiles,
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';

/**
 * Controller: Get all audit and recification reports (paginated + searchable).
 * Standalone users can only access their own reports; TMs can access reports of their clients (standAloneId).
 * Query params are validated and passed to service layer for filtering, pagination, and sorting.
 * Access control is enforced based on user role and associated IDs.
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, validated query params).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getAllAuditAndRecificationReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchAuditAndRecificationReportsQueryInput) };

  // Standalone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = String(req.user._id);
  }
  // TM: standAloneId already comes from validated query params

  const result = await auditAndRecificationReportServices.getAllAuditAndRecificationReport(query);
  ServerResponse(res, true, 200, 'Audit and recification reports retrieved successfully', result);
});

/**
 * Controller: Get a single audit and recification report by ID.
 * Standalone users can only access their own reports; TMs can access reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, report ID from params, optional standAloneId for TM).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getAuditAndRecificationReportById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = String(req.user._id);
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = String(req.query?.standAloneId || '');
    if (!accessId) {
      throw new Error('standAloneId is required for transport manager');
    }
  }

  const result = await auditAndRecificationReportServices.getAuditAndRecificationReportById(id as string, accessId);
  ServerResponse(res, true, 200, 'Audit and recification report retrieved successfully', result);
});

/**
 * Controller: Create a new audit and recification report as a Transport Manager.
 * The TM must specify the standAloneId of the client for whom the report is being created.
 * The createdBy field is set to the TM's user ID.
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, report data from body including standAloneId).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const createAuditAndRecificationReportAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const files = extractUploadedFiles((req as any).files, ['attachments', 'files']);

  let uploadedDocuments: Awaited<ReturnType<typeof uploadFilesAndCreateDocuments>>['documents'] = [];

  try {
    if (files.length) {
      const uploadResult = await uploadFilesAndCreateDocuments(files, userId, 'audit-and-recification-report');
      uploadedDocuments = uploadResult.documents;

      const uploadedIds = uploadedDocuments.map((doc) => String(doc._id));
      req.body.attachments = Array.isArray(req.body.attachments)
        ? [...req.body.attachments, ...uploadedIds]
        : uploadedIds;
    }

    const result = await auditAndRecificationReportServices.createAuditAndRecificationReportAsManager(req.body);
    if (!result) throw new Error('Failed to create audit and recification report');
    ServerResponse(res, true, 201, 'Audit and recification report created successfully', result);
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
});

/**
 * Controller: Create a new audit and recification report as a Standalone User.
 * The createdBy field is set to the user's own ID.
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, report data from body).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const createAuditAndRecificationReportAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const files = extractUploadedFiles((req as any).files, ['attachments', 'files']);

  let uploadedDocuments: Awaited<ReturnType<typeof uploadFilesAndCreateDocuments>>['documents'] = [];

  try {
    if (files.length) {
      const uploadResult = await uploadFilesAndCreateDocuments(files, userId, 'audit-and-recification-report');
      uploadedDocuments = uploadResult.documents;

      const uploadedIds = uploadedDocuments.map((doc) => String(doc._id));
      req.body.attachments = Array.isArray(req.body.attachments)
        ? [...req.body.attachments, ...uploadedIds]
        : uploadedIds;
    }

    const result = await auditAndRecificationReportServices.createAuditAndRecificationReportAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create audit and recification report');
    ServerResponse(res, true, 201, 'Audit and recification report created successfully', result);
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
});

/**
 * Controller: Update an existing audit and recification report by ID.
 * Standalone users can only update their own reports; TMs can update reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, report ID from params, optional standAloneId for TM, updated data from body).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const updateAuditAndRecificationReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const paramToStringArray = (p?: string | string[]) => {
    if (!p) return [] as string[];
    return Array.isArray(p) ? p : [p];
  };

  const id = paramToString(req.params.id);
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const files = extractUploadedFiles((req as any).files, ['attachments', 'files']);
  const removeAttachmentIds = paramToStringArray((req.body as any).removeAttachmentIds);

  if ('removeAttachmentIds' in req.body) {
    delete (req.body as any).removeAttachmentIds;
  }
  if ('attachments' in req.body) {
    delete (req.body as any).attachments;
  }

  const result = await auditAndRecificationReportServices.updateAuditAndRecificationReport(
    id as string,
    req.body,
    accessId,
    req.user!._id,
    files,
    removeAttachmentIds
  );

  if (!result) throw new Error('Failed to update audit-and-recification-report');
  ServerResponse(res, true, 200, 'Audit-and-recification-report updated successfully', result);
});

/**
 * Controller: Delete an audit and recification report by ID.
 * Standalone users can only delete their own reports; TMs can delete reports of their clients (standAloneId).
 * Access control is enforced based on user role and associated IDs.
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, report ID from params, optional standAloneId for TM).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const deleteAuditAndRecificationReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await auditAndRecificationReportServices.deleteAuditAndRecificationReport(id as string, accessId);
  ServerResponse(res, true, 200, 'Audit and recification report deleted successfully');
});
