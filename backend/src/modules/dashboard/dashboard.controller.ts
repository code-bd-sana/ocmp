import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { Response } from 'express';
import { dashboardServices } from './dashboard.service';
import catchAsync from '../../utils/catch-async/catch-async';

export const getSuperAdminDashboard = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const data = await dashboardServices.getSuperAdminDashboard();

    return res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data,
    });
  }
);

export const getDashboardSummary = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await dashboardServices.getDashboardSummary(req.user!._id, req.user!.role);

  return res.status(200).json({
    success: true,
    message: 'Dashboard summary fetched successfully',
    data,
  });
});
