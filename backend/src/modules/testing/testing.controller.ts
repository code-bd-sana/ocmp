import { Request, Response } from 'express';
import { testingServices } from './testing.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single Testing.
 *
 * @param {Request} req - The request object containing testing data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>>} - The created testing.
 * @throws {Error} - Throws an error if the testing creation fails.
 */
export const createTesting = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new testing and get the result
  const result = await testingServices.createTesting(req.body);
  if (!result) throw new Error('Failed to create testing');
  // Send a success response with the created testing data
  ServerResponse(res, true, 201, 'Testing created successfully', result);
});

/**
 * Controller function to handle the creation of multiple testings.
 *
 * @param {Request} req - The request object containing an array of testing data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>[]>} - The created testings.
 * @throws {Error} - Throws an error if the testings creation fails.
 */
export const createManyTesting = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple testings and get the result
  const result = await testingServices.createManyTesting(req.body);
  if (!result) throw new Error('Failed to create multiple testings');
  // Send a success response with the created testings data
  ServerResponse(res, true, 201, 'Testings created successfully', result);
});

/**
 * Controller function to handle the update operation for a single testing.
 *
 * @param {Request} req - The request object containing the ID of the testing to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>>} - The updated testing.
 * @throws {Error} - Throws an error if the testing update fails.
 */
export const updateTesting = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the testing by ID and get the result
  const result = await testingServices.updateTesting(id as string, req.body);
  if (!result) throw new Error('Failed to update testing');
  // Send a success response with the updated testing data
  ServerResponse(res, true, 200, 'Testing updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple testings.
 *
 * @param {Request} req - The request object containing an array of testing data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>[]>} - The updated testings.
 * @throws {Error} - Throws an error if the testings update fails.
 */
export const updateManyTesting = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple testings and get the result
  const result = await testingServices.updateManyTesting(req.body);
  if (!result.length) throw new Error('Failed to update multiple testings');
  // Send a success response with the updated testings data
  ServerResponse(res, true, 200, 'Testings updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single testing.
 *
 * @param {Request} req - The request object containing the ID of the testing to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>>} - The deleted testing.
 * @throws {Error} - Throws an error if the testing deletion fails.
 */
export const deleteTesting = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the testing by ID
  const result = await testingServices.deleteTesting(id as string);
  if (!result) throw new Error('Failed to delete testing');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Testing deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple testings.
 *
 * @param {Request} req - The request object containing an array of IDs of testing to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>[]>} - The deleted testings.
 * @throws {Error} - Throws an error if the testing deletion fails.
 */
export const deleteManyTesting = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple testings and get the result
  const result = await testingServices.deleteManyTesting(req.body);
  if (!result) throw new Error('Failed to delete multiple testings');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Testings deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single testing by ID.
 *
 * @param {Request} req - The request object containing the ID of the testing to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>>} - The retrieved testing.
 * @throws {Error} - Throws an error if the testing retrieval fails.
 */
export const getTestingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the testing by ID and get the result
  const result = await testingServices.getTestingById(id as string);
  if (!result) throw new Error('Testing not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Testing retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple testings.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITesting>[]>} - The retrieved testings.
 * @throws {Error} - Throws an error if the testings retrieval fails.
 */
export const getManyTesting = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters 
  const query = req.query as SearchQueryInput;
  // Call the service method to get multiple testings based on query parameters and get the result
  const { testings, totalData, totalPages } = await testingServices.getManyTesting(query);
  if (!testings) throw new Error('Failed to retrieve testings');
  // Send a success response with the retrieved testings data
  ServerResponse(res, true, 200, 'Testings retrieved successfully', { testings, totalData, totalPages });
});