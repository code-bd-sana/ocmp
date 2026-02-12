import { Request, Response } from 'express';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { userServices } from './user.service';

/**
 * Controller function to handle the update operation for a single user.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the user to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>>} - The updated user.
 * @throws {Error} - Throws an error if the user update fails.
 */
export const updateUser = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  // Call the service method to update the user by ID and get the result
  const result = await userServices.updateUser(userId as string, req.body);
  if (!result) throw new Error('Failed to update user');
  // Send a success response with the updated user data
  ServerResponse(res, true, 200, 'User updated successfully', result);
});

/**
 * Controller function to handle fetching the user profile.
 *
 * @param {AuthenticatedRequest} req - The request object containing the ID of the user in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser | null>>} - The user profile.
 * @throws {Error} - Throws an error if fetching the user profile fails.
 */
export const getUserProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  // Call the service method to get the user profile by ID
  const result = await userServices.getUserProfile(userId as string);
  if (!result) throw new Error('Failed to get user profile');
  // Send a success response with the user profile data
  ServerResponse(res, true, 200, 'User profile fetched successfully', result);
});

/**
 * Controller function to handle fetching a user by ID.
 *
 * @param {Request } req - The request object containing the ID of the user in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser | null>>} - The user data.
 * @throws {Error} - Throws an error if fetching the user fails.
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  // Call the service method to get the user by ID
  const result = await userServices.getUserProfile(userId);
  if (!result) throw new Error('Failed to get user');
  // Send a success response with the user data
  ServerResponse(res, true, 200, 'User fetched successfully', result);
});
