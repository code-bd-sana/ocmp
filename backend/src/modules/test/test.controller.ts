import { Request, Response } from 'express';
import { testServices } from './test.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single Test.
 *
 * @param {Request} req - The request object containing test data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>>} - The created test.
 * @throws {Error} - Throws an error if the test creation fails.
 */
export const createTest = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new test and get the result
  const result = await testServices.createTest(req.body);
  if (!result) throw new Error('Failed to create test');
  // Send a success response with the created test data
  ServerResponse(res, true, 201, 'Test created successfully', result);
});

/**
 * Controller function to handle the creation of multiple tests.
 *
 * @param {Request} req - The request object containing an array of test data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>[]>} - The created tests.
 * @throws {Error} - Throws an error if the tests creation fails.
 */
export const createManyTest = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple tests and get the result
  const result = await testServices.createManyTest(req.body);
  if (!result) throw new Error('Failed to create multiple tests');
  // Send a success response with the created tests data
  ServerResponse(res, true, 201, 'Tests created successfully', result);
});

/**
 * Controller function to handle the update operation for a single test.
 *
 * @param {Request} req - The request object containing the ID of the test to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>>} - The updated test.
 * @throws {Error} - Throws an error if the test update fails.
 */
export const updateTest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the test by ID and get the result
  const result = await testServices.updateTest(id as string, req.body);
  if (!result) throw new Error('Failed to update test');
  // Send a success response with the updated test data
  ServerResponse(res, true, 200, 'Test updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple tests.
 *
 * @param {Request} req - The request object containing an array of test data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>[]>} - The updated tests.
 * @throws {Error} - Throws an error if the tests update fails.
 */
export const updateManyTest = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple tests and get the result
  const result = await testServices.updateManyTest(req.body);
  if (!result.length) throw new Error('Failed to update multiple tests');
  // Send a success response with the updated tests data
  ServerResponse(res, true, 200, 'Tests updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single test.
 *
 * @param {Request} req - The request object containing the ID of the test to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>>} - The deleted test.
 * @throws {Error} - Throws an error if the test deletion fails.
 */
export const deleteTest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the test by ID
  const result = await testServices.deleteTest(id as string);
  if (!result) throw new Error('Failed to delete test');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Test deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple tests.
 *
 * @param {Request} req - The request object containing an array of IDs of test to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>[]>} - The deleted tests.
 * @throws {Error} - Throws an error if the test deletion fails.
 */
export const deleteManyTest = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple tests and get the result
  const result = await testServices.deleteManyTest(req.body);
  if (!result) throw new Error('Failed to delete multiple tests');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Tests deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single test by ID.
 *
 * @param {Request} req - The request object containing the ID of the test to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>>} - The retrieved test.
 * @throws {Error} - Throws an error if the test retrieval fails.
 */
export const getTestById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the test by ID and get the result
  const result = await testServices.getTestById(id as string);
  if (!result) throw new Error('Test not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Test retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple tests.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITest>[]>} - The retrieved tests.
 * @throws {Error} - Throws an error if the tests retrieval fails.
 */
export const getManyTest = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters 
  const query = req.query as unknown as { searchKey?: string, showPerPage: number, pageNo: number };
  // Call the service method to get multiple tests based on query parameters and get the result
  const { tests, totalData, totalPages } = await testServices.getManyTest(query);
  if (!tests) throw new Error('Failed to retrieve tests');
  // Send a success response with the retrieved tests data
  ServerResponse(res, true, 200, 'Tests retrieved successfully', { tests, totalData, totalPages });
});