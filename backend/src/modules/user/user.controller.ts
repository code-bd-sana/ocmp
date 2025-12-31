import { Request, Response } from 'express';
import { userServices } from './user.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single User.
 *
 * @param {Request} req - The request object containing user data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>>} - The created user.
 * @throws {Error} - Throws an error if the user creation fails.
 */
export const createUser = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new user and get the result
  const result = await userServices.createUser(req.body);
  if (!result) throw new Error('Failed to create user');
  // Send a success response with the created user data
  ServerResponse(res, true, 201, 'User created successfully', result);
});

/**
 * Controller function to handle the creation of multiple users.
 *
 * @param {Request} req - The request object containing an array of user data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>[]>} - The created users.
 * @throws {Error} - Throws an error if the users creation fails.
 */
export const createManyUser = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple users and get the result
  const result = await userServices.createManyUser(req.body);
  if (!result) throw new Error('Failed to create multiple users');
  // Send a success response with the created users data
  ServerResponse(res, true, 201, 'Users created successfully', result);
});

/**
 * Controller function to handle the update operation for a single user.
 *
 * @param {Request} req - The request object containing the ID of the user to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>>} - The updated user.
 * @throws {Error} - Throws an error if the user update fails.
 */
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the user by ID and get the result
  const result = await userServices.updateUser(id, req.body);
  if (!result) throw new Error('Failed to update user');
  // Send a success response with the updated user data
  ServerResponse(res, true, 200, 'User updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple users.
 *
 * @param {Request} req - The request object containing an array of user data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>[]>} - The updated users.
 * @throws {Error} - Throws an error if the users update fails.
 */
export const updateManyUser = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple users and get the result
  const result = await userServices.updateManyUser(req.body);
  if (!result.length) throw new Error('Failed to update multiple users');
  // Send a success response with the updated users data
  ServerResponse(res, true, 200, 'Users updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single user.
 *
 * @param {Request} req - The request object containing the ID of the user to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>>} - The deleted user.
 * @throws {Error} - Throws an error if the user deletion fails.
 */
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the user by ID
  const result = await userServices.deleteUser(id);
  if (!result) throw new Error('Failed to delete user');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'User deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple users.
 *
 * @param {Request} req - The request object containing an array of IDs of user to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>[]>} - The deleted users.
 * @throws {Error} - Throws an error if the user deletion fails.
 */
export const deleteManyUser = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple users and get the result
  const result = await userServices.deleteManyUser(req.body);
  if (!result) throw new Error('Failed to delete multiple users');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Users deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single user by ID.
 *
 * @param {Request} req - The request object containing the ID of the user to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>>} - The retrieved user.
 * @throws {Error} - Throws an error if the user retrieval fails.
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the user by ID and get the result
  const result = await userServices.getUserById(id);
  if (!result) throw new Error('User not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'User retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple users.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IUser>[]>} - The retrieved users.
 * @throws {Error} - Throws an error if the users retrieval fails.
 */
export const getManyUser = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters 
  const query = req.query as unknown as { searchKey?: string, showPerPage: number, pageNo: number };
  // Call the service method to get multiple users based on query parameters and get the result
  const { users, totalData, totalPages } = await userServices.getManyUser(query);
  if (!users) throw new Error('Failed to retrieve users');
  // Send a success response with the retrieved users data
  ServerResponse(res, true, 200, 'Users retrieved successfully', { users, totalData, totalPages });
});