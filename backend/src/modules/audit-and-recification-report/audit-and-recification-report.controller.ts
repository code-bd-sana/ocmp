import { Request, Response } from 'express';
import { auditAndRecificationReportServices } from './audit-and-recification-report.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { SearchAuditAndRecificationReportsQueryInput } from './audit-and-recification-report.validation';
import { UserRole } from '../../models';
import mongoose from 'mongoose';

export const getAllAuditAndRecificationReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchAuditAndRecificationReportsQueryInput) };

  // Standalone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await auditAndRecificationReportServices.getAllAuditAndRecificationReport(query);
  ServerResponse(res, true, 200, 'Audit and recification reports retrieved successfully', result);
});

export const getAuditAndRecificationReportById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = req.query?.standAloneId as string;
  }

  const result = await auditAndRecificationReportServices.getAuditAndRecificationReportById(id as string, accessId);
  ServerResponse(res, true, 200, 'Audit and recification report retrieved successfully', result);
});

export const createAuditAndRecificationReportAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await auditAndRecificationReportServices.createAuditAndRecificationReportAsManager(req.body);
  if (!result) throw new Error('Failed to create audit and recification report');
  ServerResponse(res, true, 201, 'Audit and recification report created successfully', result);
});

export const createAuditAndRecificationReportAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await auditAndRecificationReportServices.createAuditAndRecificationReportAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create audit and recification report');
  ServerResponse(res, true, 201, 'Audit and recification report created successfully', result);
});

export const updateAuditAndRecificationReport = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const id = paramToString(req.params.id);
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await auditAndRecificationReportServices.updateAuditAndRecificationReport(id as string, req.body, accessId);

  if (!result) throw new Error('Failed to update audit-and-recification-report');
  ServerResponse(res, true, 200, 'Audit-and-recification-report updated successfully', result);
});

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
