import { Request, Response } from 'express';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import catchAsync from '../../utils/catch-async/catch-async';
import { paymentServices } from './payment.service';

/**
 * Controller function to handle the creation of a single payment.
 *
 * @param {Request} req - The request object containing payment data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPayment>>} - The created payment.
 * @throws {Error} - Throws an error if the payment creation fails.
 */
export const createPayment = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // Call the service method to create a new payment and get the result
  const result = await paymentServices.createPayment(req, req.body);
  if (!result) throw new Error('Failed to create payment');
  // Send a success response with the created payment data
  ServerResponse(res, true, 201, 'Payment created successfully', result);
});

export const stripePaymentWebHook = catchAsync(async (req: Request, res: Response) => {
  await paymentServices.stripePaymentWebHook(req);
  // Send a success response to acknowledge receipt of the webhook event
  res.status(200).send('Webhook received successfully');
});

/**
 * Controller function to handle the retrieval of a single payment by ID.
 *
 * @param {Request} req - The request object containing the ID of the payment to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPayment>>} - The retrieved payment.
 * @throws {Error} - Throws an error if the payment retrieval fails.
 */
export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the payment by ID and get the result
  const result = await paymentServices.getPaymentById(id as string);
  if (!result) throw new Error('Payment not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Payment retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple payments.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IPayment>[]>} - The retrieved payments.
 * @throws {Error} - Throws an error if the payments retrieval fails.
 */
export const getManyPayment = catchAsync(async (req: Request, res: Response) => {
  // Use the validated and transformed query from Zod middleware
  const query = (req as any).validatedQuery as SearchQueryInput;
  // Call the service method to get multiple payments based on query parameters and get the result
  const { payments, totalData, totalPages } = await paymentServices.getManyPayment(query);
  if (!payments) throw new Error('Failed to retrieve payments');
  // Send a success response with the retrieved payments data
  ServerResponse(res, true, 200, 'Payments retrieved successfully', {
    payments,
    totalData,
    totalPages,
  });
});
