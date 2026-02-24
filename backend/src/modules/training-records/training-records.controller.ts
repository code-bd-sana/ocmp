import { Response } from 'express';
import { trainingRecordsServices } from './training-records.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchRecordsQueryInput } from './training-records.validation';

// ═══════════════════════════════════════════════════════════════
// GET — Grouped Training Records Report
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get grouped training records report.
 * Groups register entries by unique (participantId, trainingId, trainingInterval).
 * GET /api/v1/training-records/get-training-records
 */
export const getTrainingRecords = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchRecordsQueryInput) };

  // Standalone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await trainingRecordsServices.getTrainingRecords(query);
  ServerResponse(res, true, 200, 'Training records retrieved successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// PATCH — Update Status of Individual Register Entry
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Update the status of a single training register entry.
 * PATCH /api/v1/training-records/update-record-status-by-manager/:registerId/:standAloneId (TM)
 * PATCH /api/v1/training-records/update-record-status/:registerId (Standalone)
 */
export const updateRecordStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const registerId = paramToString(req.params.registerId);

  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;

  const result = await trainingRecordsServices.updateRecordStatus(registerId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Training record status updated successfully', result);
});