import { Response } from 'express';
import mongoose from 'mongoose';
import { renewalTrackerServices } from './renewal-tracker.service';
import {
  UpdateRenewalTrackerInput,
} from './renewal-tracker.validation';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';

const paramToString = (val: string | string[] | Record<string, string>): string =>
  Array.isArray(val) ? String(val[0]) : typeof val === 'object' ? String(Object.values(val)[0]) : String(val);

export const createRenewalTrackerAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  req.body.createdBy = new mongoose.Types.ObjectId(req.user!._id);
  const result = await renewalTrackerServices.createRenewalTrackerAsManager(req.body);
  ServerResponse(res, true, 201, 'Renewal tracker created successfully', result);
});

export const createRenewalTrackerAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  req.body.createdBy = new mongoose.Types.ObjectId(req.user!._id);
  const result = await renewalTrackerServices.createRenewalTrackerAsStandAlone(req.body);
  ServerResponse(res, true, 201, 'Renewal tracker created successfully', result);
});

export const getManyRenewalTrackerAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = {
      ...((req as any).validatedQuery as SearchQueryInput),
      requesterId: req.user!._id,
      requesterRole: req.user!.role,
      standAloneId: (req as any).validatedQuery.standAloneId,
    };

    const { renewalTrackers, totalData, totalPages } =
      await renewalTrackerServices.getManyRenewalTracker(query);
    ServerResponse(res, true, 200, 'Renewal trackers retrieved successfully', {
      renewalTrackers,
      totalData,
      totalPages,
    });
  }
);

export const getManyRenewalTrackerAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = {
      ...((req as any).validatedQuery as SearchQueryInput),
      requesterId: req.user!._id,
      requesterRole: req.user!.role,
      standAloneId: req.user!._id,
    };

    const { renewalTrackers, totalData, totalPages } =
      await renewalTrackerServices.getManyRenewalTracker(query);
    ServerResponse(res, true, 200, 'Renewal trackers retrieved successfully', {
      renewalTrackers,
      totalData,
      totalPages,
    });
  }
);

export const getRenewalTrackerByIdAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const renewalTrackerId = paramToString(req.params.id);
  const standAloneId = paramToString(req.params.standAloneId);
  const result = await renewalTrackerServices.getRenewalTrackerById(renewalTrackerId, standAloneId);
  ServerResponse(res, true, 200, 'Renewal tracker retrieved successfully', result);
});

export const getRenewalTrackerByIdAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const renewalTrackerId = paramToString(req.params.id);
  const accessId = req.user!._id;
  const result = await renewalTrackerServices.getRenewalTrackerById(renewalTrackerId, accessId);
  ServerResponse(res, true, 200, 'Renewal tracker retrieved successfully', result);
});

export const updateRenewalTrackerAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const renewalTrackerId = paramToString(req.params.id);
  const standAloneId = paramToString(req.params.standAloneId);
  const body = req.body as UpdateRenewalTrackerInput;
  const result = await renewalTrackerServices.updateRenewalTracker(renewalTrackerId, body, standAloneId);
  ServerResponse(res, true, 200, 'Renewal tracker updated successfully', result);
});

export const updateRenewalTrackerAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const renewalTrackerId = paramToString(req.params.id);
  const accessId = req.user!._id;
  const body = req.body as UpdateRenewalTrackerInput;
  const result = await renewalTrackerServices.updateRenewalTracker(renewalTrackerId, body, accessId);
  ServerResponse(res, true, 200, 'Renewal tracker updated successfully', result);
});

export const deleteRenewalTrackerAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const renewalTrackerId = paramToString(req.params.id);
  const standAloneId = paramToString(req.params.standAloneId);
  await renewalTrackerServices.deleteRenewalTracker(renewalTrackerId, standAloneId);
  ServerResponse(res, true, 200, 'Renewal tracker deleted successfully');
});

export const deleteRenewalTrackerAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const renewalTrackerId = paramToString(req.params.id);
  const accessId = req.user!._id;
  await renewalTrackerServices.deleteRenewalTracker(renewalTrackerId, accessId);
  ServerResponse(res, true, 200, 'Renewal tracker deleted successfully');
});
