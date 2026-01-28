import { Request, Response } from 'express';
import { testSubscriptionServices } from './test-subscription.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single TestSubscription.
 *
 * @param {Request} req - The request object containing test-subscription data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>>} - The created testSubscription.
 * @throws {Error} - Throws an error if the testSubscription creation fails.
 */
export const createTestSubscription = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new test-subscription and get the result
  const result = await testSubscriptionServices.createTestSubscription(req.body);
  if (!result) throw new Error('Failed to create testSubscription');
  // Send a success response with the created testSubscription data
  ServerResponse(res, true, 201, 'TestSubscription created successfully', result);
});

/**
 * Controller function to handle the creation of multiple test-subscriptions.
 *
 * @param {Request} req - The request object containing an array of test-subscription data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The created testSubscriptions.
 * @throws {Error} - Throws an error if the testSubscriptions creation fails.
 */
export const createManyTestSubscription = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple testSubscriptions and get the result
  const result = await testSubscriptionServices.createManyTestSubscription(req.body);
  if (!result) throw new Error('Failed to create multiple testSubscriptions');
  // Send a success response with the created test-subscriptions data
  ServerResponse(res, true, 201, 'TestSubscriptions created successfully', result);
});

/**
 * Controller function to handle the update operation for a single test-subscription.
 *
 * @param {Request} req - The request object containing the ID of the test-subscription to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>>} - The updated testSubscription.
 * @throws {Error} - Throws an error if the testSubscription update fails.
 */
export const updateTestSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the test-subscription by ID and get the result
  const result = await testSubscriptionServices.updateTestSubscription(id as string, req.body);
  if (!result) throw new Error('Failed to update testSubscription');
  // Send a success response with the updated test-subscription data
  ServerResponse(res, true, 200, 'TestSubscription updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple test-subscriptions.
 *
 * @param {Request} req - The request object containing an array of test-subscription data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The updated testSubscriptions.
 * @throws {Error} - Throws an error if the testSubscriptions update fails.
 */
export const updateManyTestSubscription = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple test-subscriptions and get the result
  const result = await testSubscriptionServices.updateManyTestSubscription(req.body);
  if (!result.length) throw new Error('Failed to update multiple testSubscriptions');
  // Send a success response with the updated test-subscriptions data
  ServerResponse(res, true, 200, 'TestSubscriptions updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single test-subscription.
 *
 * @param {Request} req - The request object containing the ID of the test-subscription to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>>} - The deleted testSubscription.
 * @throws {Error} - Throws an error if the testSubscription deletion fails.
 */
export const deleteTestSubscription = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the test-subscription by ID
  const result = await testSubscriptionServices.deleteTestSubscription(id as string);
  if (!result) throw new Error('Failed to delete testSubscription');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'TestSubscription deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple test-subscriptions.
 *
 * @param {Request} req - The request object containing an array of IDs of test-subscription to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The deleted testSubscriptions.
 * @throws {Error} - Throws an error if the testSubscription deletion fails.
 */
export const deleteManyTestSubscription = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple test-subscriptions and get the result
  const result = await testSubscriptionServices.deleteManyTestSubscription(req.body.ids);
  if (!result) throw new Error('Failed to delete multiple testSubscriptions');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'TestSubscriptions deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single test-subscription by ID.
 *
 * @param {Request} req - The request object containing the ID of the test-subscription to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>>} - The retrieved testSubscription.
 * @throws {Error} - Throws an error if the testSubscription retrieval fails.
 */
export const getTestSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the test-subscription by ID and get the result
  const result = await testSubscriptionServices.getTestSubscriptionById(id as string);
  if (!result) throw new Error('TestSubscription not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'TestSubscription retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple test-subscriptions.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The retrieved testSubscriptions.
 * @throws {Error} - Throws an error if the testSubscriptions retrieval fails.
 */
export const getManyTestSubscription = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters
  const query = req.query as unknown as { searchKey?: string; showPerPage: number; pageNo: number };
  // Call the service method to get multiple test-subscriptions based on query parameters and get the result
  const { testSubscriptions, totalData, totalPages } =
    await testSubscriptionServices.getManyTestSubscription(query);
  if (!testSubscriptions) throw new Error('Failed to retrieve testSubscriptions');
  // Send a success response with the retrieved test-subscriptions data
  ServerResponse(res, true, 200, 'TestSubscriptions retrieved successfully', {
    testSubscriptions,
    totalData,
    totalPages,
  });
});
