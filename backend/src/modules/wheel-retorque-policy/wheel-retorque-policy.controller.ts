import { Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import catchAsync from '../../utils/catch-async/catch-async';
import { wheelRetorquePolicyServices } from './wheel-retorque-policy.service';
import { SearchWheelRetorquePolicyMonitoringsQueryInput } from './wheel-retorque-policy.validation';

export const createWheelRetorquePolicyMonitoringAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    const result = await wheelRetorquePolicyServices.createWheelRetorquePolicyMonitoringAsManager(
      req.body
    );
    if (!result) throw new Error('Failed to create wheel re-torque policy monitoring');
    ServerResponse(res, true, 201, 'Wheel re-torque policy monitoring created successfully', result);
  }
);

export const createWheelRetorquePolicyMonitoringAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    const result =
      await wheelRetorquePolicyServices.createWheelRetorquePolicyMonitoringAsStandAlone(req.body);
    if (!result) throw new Error('Failed to create wheel re-torque policy monitoring');
    ServerResponse(res, true, 201, 'Wheel re-torque policy monitoring created successfully', result);
  }
);

export const getAllWheelRetorquePolicyMonitorings = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = {
      ...((req as any).validatedQuery as SearchWheelRetorquePolicyMonitoringsQueryInput),
    };

    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.standAloneId = req.user._id;
    }

    const result = await wheelRetorquePolicyServices.getAllWheelRetorquePolicyMonitorings(query);
    ServerResponse(
      res,
      true,
      200,
      'Wheel re-torque policy monitorings retrieved successfully',
      result
    );
  }
);

export const getWheelRetorquePolicyMonitoringById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { wheelRetorquePolicyMonitoringId } = req.params;
    let accessId: string | undefined;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      accessId = req.user._id;
    }
    if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
      accessId = req.params?.standAloneId as string;
    }

    const result = await wheelRetorquePolicyServices.getWheelRetorquePolicyMonitoringById(
      wheelRetorquePolicyMonitoringId as string,
      accessId
    );
    ServerResponse(
      res,
      true,
      200,
      'Wheel re-torque policy monitoring retrieved successfully',
      result
    );
  }
);

export const updateWheelRetorquePolicyMonitoring = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const wheelRetorquePolicyMonitoringId = paramToString(
      req.params.wheelRetorquePolicyMonitoringId
    );
    const accessId =
      req.user!.role === UserRole.TRANSPORT_MANAGER
        ? (paramToString(req.params.standAloneId) as string)
        : req.user!._id;

    const result = await wheelRetorquePolicyServices.updateWheelRetorquePolicyMonitoring(
      wheelRetorquePolicyMonitoringId as string,
      req.body,
      accessId
    );

    ServerResponse(
      res,
      true,
      200,
      'Wheel re-torque policy monitoring updated successfully',
      result
    );
  }
);

export const deleteWheelRetorquePolicyMonitoring = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const wheelRetorquePolicyMonitoringId = paramToString(
      req.params.wheelRetorquePolicyMonitoringId
    );
    const accessId =
      req.user!.role === UserRole.TRANSPORT_MANAGER
        ? (paramToString(req.params.standAloneId) as string)
        : req.user!._id;

    await wheelRetorquePolicyServices.deleteWheelRetorquePolicyMonitoring(
      wheelRetorquePolicyMonitoringId as string,
      accessId
    );

    ServerResponse(res, true, 200, 'Wheel re-torque policy monitoring deleted successfully');
  }
);
