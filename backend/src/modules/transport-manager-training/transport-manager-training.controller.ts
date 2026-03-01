import { Response } from 'express';
import { transportManagerTrainingServices } from './transport-manager-training.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';

/**
 * Controller function to handle the creation of a single transport-manager-training.
 *
 * @param {Request} req - The request object containing transport-manager-training data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The created transport-manager-training.
 * @throws {Error} - Throws an error if the transport-manager-training creation fails.
 */
export const createTransportManagerTraining = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Call the service method to create a new transport-manager-training and get the result
    const result = await transportManagerTrainingServices.createTransportManagerTraining(
      req.body,
      req.user!._id
    );
    if (!result) throw new Error('Failed to create transport-manager-training');
    // Send a success response with the created transport-manager-training data
    ServerResponse(res, true, 201, 'Transport-manager-training created successfully', result);
  }
);

/**
 * Controller function to handle the update operation for a single transport-manager-training.
 *
 * @param {Request} req - The request object containing the ID of the transport-manager-training to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The updated transport-manager-training.
 * @throws {Error} - Throws an error if the transport-manager-training update fails.
 */
export const updateTransportManagerTraining = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    // Call the service method to update the transport-manager-training by ID and get the result
    const result = await transportManagerTrainingServices.updateTransportManagerTraining(
      id as string,
      req.body,
      req.user!._id
    );
    if (!result) throw new Error('Failed to update transport-manager-training');
    // Send a success response with the updated transport-manager-training data
    ServerResponse(res, true, 200, 'Transport-manager-training updated successfully', result);
  }
);

/**
 * Controller function to handle the deletion of a single transport-manager-training.
 *
 * @param {Request} req - The request object containing the ID of the transport-manager-training to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The deleted transport-manager-training.
 * @throws {Error} - Throws an error if the transport-manager-training deletion fails.
 */
export const deleteTransportManagerTraining = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    // Call the service method to delete the transport-manager-training by ID
    const result = await transportManagerTrainingServices.deleteTransportManagerTraining(
      id as string,
      req.user!._id
    );
    if (!result) throw new Error('Failed to delete transport-manager-training');
    // Send a success response confirming the deletion
    ServerResponse(res, true, 200, 'Transport-manager-training deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single transport-manager-training by ID.
 *
 * @param {Request} req - The request object containing the ID of the transport-manager-training to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The retrieved transport-manager-training.
 * @throws {Error} - Throws an error if the transport-manager-training retrieval fails.
 */
export const getTransportManagerTrainingById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    // Call the service method to get the transport-manager-training by ID and get the result
    const result = await transportManagerTrainingServices.getTransportManagerTrainingById(
      id as string,
      req.user!._id
    );
    if (!result) throw new Error('Transport-manager-training not found');
    // Send a success response with the retrieved resource data
    ServerResponse(res, true, 200, 'Transport-manager-training retrieved successfully', result);
  }
);

/**
 * Controller function to handle the retrieval of multiple transport-manager-trainings.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITransportManagerTraining>[]>} - The retrieved transport-manager-trainings.
 * @throws {Error} - Throws an error if the transport-manager-trainings retrieval fails.
 */
export const getManyTransportManagerTraining = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Use the validated and transformed query from Zod middleware
    const query = (req as any).validatedQuery as SearchQueryInput;
    // Call the service method to get multiple transport-manager-trainings based on query parameters and get the result
    const { transportManagerTrainings, totalData, totalPages } =
      await transportManagerTrainingServices.getManyTransportManagerTraining(query, req.user!._id);
    if (!transportManagerTrainings)
      throw new Error('Failed to retrieve transport-manager-trainings');
    // Send a success response with the retrieved transport-manager-trainings data
    ServerResponse(res, true, 200, 'Transport-manager-trainings retrieved successfully', {
      transportManagerTrainings,
      totalData,
      totalPages,
    });
  }
);

