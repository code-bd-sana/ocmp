import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { trainingToolboxServices } from './training-toolbox.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  extractUploadedFiles,
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';

/**
 * Controller function to handle the creation of a single training-toolbox.
 *
 * @param {Request} req - The request object containing training-toolbox data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The created training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox creation fails.
 */
export const createTrainingToolboxAsManager = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.deliveredBy = new mongoose.Types.ObjectId(userId);
    if (req.body.standAloneId) {
      req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
    }

    const files = extractUploadedFiles((req as any).files, ['attachments', 'files']);
    let uploadedDocuments: Awaited<ReturnType<typeof uploadFilesAndCreateDocuments>>['documents'] = [];

    try {
      if (files.length) {
        const uploadResult = await uploadFilesAndCreateDocuments(files, userId, 'training-toolbox');
        uploadedDocuments = uploadResult.documents;

        const uploadedIds = uploadedDocuments.map((doc) => String(doc._id));
        req.body.attachments = Array.isArray(req.body.attachments)
          ? [...req.body.attachments, ...uploadedIds]
          : uploadedIds;
      }

      const result = await trainingToolboxServices.createTrainingToolbox(req.body);
      if (!result) throw new Error('Failed to create training-toolbox');
      ServerResponse(res, true, 201, 'Training-toolbox created successfully', result);
    } catch (error) {
      if (uploadedDocuments.length) {
        await rollbackUploadedDocuments(uploadedDocuments);
      }
      throw error;
    }
  }
);

export const createTrainingToolboxAsStandAlone = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!._id;
    req.body.createdBy = new mongoose.Types.ObjectId(userId);
    req.body.standAloneId = new mongoose.Types.ObjectId(userId);
    req.body.deliveredBy = new mongoose.Types.ObjectId(userId);

    const files = extractUploadedFiles((req as any).files, ['attachments', 'files']);
    let uploadedDocuments: Awaited<ReturnType<typeof uploadFilesAndCreateDocuments>>['documents'] = [];

    try {
      if (files.length) {
        const uploadResult = await uploadFilesAndCreateDocuments(files, userId, 'training-toolbox');
        uploadedDocuments = uploadResult.documents;

        const uploadedIds = uploadedDocuments.map((doc) => String(doc._id));
        req.body.attachments = Array.isArray(req.body.attachments)
          ? [...req.body.attachments, ...uploadedIds]
          : uploadedIds;
      }

      const result = await trainingToolboxServices.createTrainingToolbox(req.body);
      if (!result) throw new Error('Failed to create training-toolbox');
      ServerResponse(res, true, 201, 'Training-toolbox created successfully', result);
    } catch (error) {
      if (uploadedDocuments.length) {
        await rollbackUploadedDocuments(uploadedDocuments);
      }
      throw error;
    }
  }
);

/**
 * Controller function to handle the update operation for a single training-toolbox.
 *
 * @param {Request} req - The request object containing the ID of the training-toolbox to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The updated training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox update fails.
 */
export const updateTrainingToolbox = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const paramToStringArray = (p?: string | string[]) => {
      if (!p) return [] as string[];
      return Array.isArray(p) ? p : [p];
    };
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);
    const files = extractUploadedFiles((req as any).files, ['attachments', 'files']);
    const removeAttachmentIds = paramToStringArray((req.body as any).removeAttachmentIds);

    if (req.user?._id) {
      req.body.deliveredBy = req.user._id;
    }

    if ('removeAttachmentIds' in req.body) {
      delete (req.body as any).removeAttachmentIds;
    }
    if ('attachments' in req.body) {
      delete (req.body as any).attachments;
    }

    const result = await trainingToolboxServices.updateTrainingToolbox(
      id as string,
      req.body,
      req.user!._id,
      standAloneId as string | undefined,
      files,
      removeAttachmentIds
    );
    if (!result) {
      return ServerResponse(res, false, 404, 'Training-toolbox not found or access denied');
    }
    ServerResponse(res, true, 200, 'Training-toolbox updated successfully', result);
  }
);

/**
 * Controller function to handle the deletion of a single training-toolbox.
 *
 * @param {Request} req - The request object containing the ID of the training-toolbox to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The deleted training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox deletion fails.
 */
export const deleteTrainingToolbox = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);

    const result = await trainingToolboxServices.deleteTrainingToolbox(
      id as string,
      req.user!._id,
      standAloneId
    );
    if (!result) {
      return ServerResponse(res, false, 404, 'Training-toolbox not found or access denied');
    }
    ServerResponse(res, true, 200, 'Training-toolbox deleted successfully');
  }
);

/**
 * Controller function to handle the retrieval of a single training-toolbox by ID.
 *
 * @param {Request} req - The request object containing the ID of the training-toolbox to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The retrieved training-toolbox.
 * @throws {Error} - Throws an error if the training-toolbox retrieval fails.
 */
export const getTrainingToolboxById = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
    const id = paramToString(req.params.id);
    const standAloneId = paramToString((req.params as any).standAloneId);
    // Call the service method to get the training-toolbox by ID and get the result
    const result = await trainingToolboxServices.getTrainingToolboxById(
      id as string,
      req.user!._id,
      standAloneId
    );
    if (!result) throw new Error('Training-toolbox not found');
    // Send a success response with the retrieved resource data
    ServerResponse(res, true, 200, 'Training-toolbox retrieved successfully', result);
  }
);

/**
 * Controller function to handle the retrieval of multiple training-toolboxes.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<ITrainingToolbox>[]>} - The retrieved training-toolboxes.
 * @throws {Error} - Throws an error if the training-toolboxes retrieval fails.
 */
export const getManyTrainingToolbox = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    // Query field assignment by role
    type TrainingToolboxSearchQuery = SearchQueryInput & {
      createdBy?: string;
      standAloneId?: string;
    };
    const query: TrainingToolboxSearchQuery = {
      ...((req as any).validatedQuery as SearchQueryInput),
    } as any;

    if (req.user?.role === UserRole.STANDALONE_USER) {
      query.createdBy = req.user._id;
    }
    if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
      query.createdBy = req.user._id;
      query.standAloneId = (req as any).validatedQuery.standAloneId;
    }

    const { toolboxes, totalData, totalPages } =
      await trainingToolboxServices.getManyTrainingToolbox(query);
    if (!toolboxes) throw new Error('Failed to retrieve training-toolboxes');
    ServerResponse(res, true, 200, 'Training-toolboxes retrieved successfully', {
      toolboxes,
      totalData,
      totalPages,
    });
  }
);
