import { Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { repositorySettingsServices } from './repository-settings.service';

/**
 * Controller: Get repository settings for the authenticated user.
 * userId comes from the token (req.user._id).
 *
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getRepositorySettings = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    const result = await repositorySettingsServices.getRepositorySettings(userId as string);
    ServerResponse(res, true, 200, 'Repository settings retrieved successfully', result);
  }
);

/**
 * Controller: Update repository settings for the authenticated user.
 * userId from token, partial boolean flags from body.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id from Redis→JWT decode, body = partial flags).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const updateRepositorySettings = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    const result = await repositorySettingsServices.updateRepositorySettings(
      userId as string,
      req.body
    );
    ServerResponse(res, true, 200, 'Repository settings updated successfully', result);
  }
);