// Import the model
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import TrainingToolboxModel, {
  ITrainingToolbox,
} from '../../models/vehicle-transport/trainingToolbox.schema';
import Driver from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import DocumentModel from '../../models/document.schema';
import { deleteObjects, getSignedDownloadUrl } from '../../utils/aws/s3';
import {
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';
import { UserRole } from '../../models';
import {
  CreateTrainingToolboxInput,
  UpdateTrainingToolboxInput,
} from './training-toolbox.validation';

interface TrainingToolboxAttachmentResponse {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

type TrainingToolboxWithAttachmentsResponse = Omit<Partial<ITrainingToolbox>, 'attachments'> & {
  attachments?: TrainingToolboxAttachmentResponse[];
};

const withSignedAttachmentUrls = async (
  toolbox: ITrainingToolbox | (Partial<ITrainingToolbox> & { _id: mongoose.Types.ObjectId | string })
): Promise<TrainingToolboxWithAttachmentsResponse> => {
  const attachmentIds = Array.isArray(toolbox.attachments)
    ? toolbox.attachments
      .map((id) => {
        if (id instanceof mongoose.Types.ObjectId) return id;
        if (mongoose.Types.ObjectId.isValid(String(id))) {
          return new mongoose.Types.ObjectId(String(id));
        }
        return null;
      })
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id))
    : [];

  if (!attachmentIds.length) {
    return {
      ...(toolbox as Partial<ITrainingToolbox>),
      attachments: [],
    } as TrainingToolboxWithAttachmentsResponse;
  }

  const documents = await DocumentModel.find({ _id: { $in: attachmentIds } })
    .select('_id filename originalName mimeType size url s3Key')
    .lean();

  const signedDocuments = await Promise.all(
    documents.map(async (doc) => {
      let downloadUrl = doc.url;

      try {
        downloadUrl = await getSignedDownloadUrl(doc.s3Key);
      } catch {
        // Fallback to persisted URL if signed URL generation fails.
      }

      return {
        _id: String(doc._id),
        filename: doc.filename,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        url: doc.url,
        downloadUrl,
      } as TrainingToolboxAttachmentResponse;
    })
  );

  const byId = new Map(signedDocuments.map((doc) => [doc._id, doc]));
  const orderedAttachments = attachmentIds
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is TrainingToolboxAttachmentResponse => Boolean(doc));

  return {
    ...(toolbox as Partial<ITrainingToolbox>),
    attachments: orderedAttachments,
  } as TrainingToolboxWithAttachmentsResponse;
};

const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

const resolveOwnerId = (entity: any): string | null => {
  if (!entity) return null;
  return entity.standAloneId
    ? entity.standAloneId.toString()
    : entity.createdBy
      ? entity.createdBy.toString()
      : null;
};

const validateDriverAndOwner = async (driverId: string, standAloneId?: string) => {
  const driver = await Driver.findById(driverId).select('standAloneId createdBy').lean();
  if (!driver) throw new Error('Driver does not exist');

  if (standAloneId) {
    const driverOwnerId = resolveOwnerId(driver);
    if (!driverOwnerId) {
      throw new Error('standAloneId does not exist for this driver');
    }
    if (driverOwnerId !== standAloneId) {
      throw new Error('Provided standAloneId does not match driver owner');
    }
  }
};

/**
 * Service function to create a new training-toolbox.
 *
 * @param {CreateTrainingToolboxInput} data - The data to create a new training-toolbox.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The created training-toolbox.
 */
const createTrainingToolbox = async (
  data: CreateTrainingToolboxInput
): Promise<Partial<ITrainingToolbox>> => {
  const standAloneId = (data as any).standAloneId?.toString?.();
  await validateDriverAndOwner(data.driverId.toString(), standAloneId);

  const newTrainingToolbox = new TrainingToolboxModel(data);
  const savedTrainingToolbox = await newTrainingToolbox.save();
  return savedTrainingToolbox;
};

/**
 * Service function to update a single training-toolbox by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to update.
 * @param {UpdateTrainingToolboxInput} data - The updated data for the training-toolbox.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The updated training-toolbox.
 */
const updateTrainingToolbox = async (
  id: IdOrIdsInput['id'],
  data: UpdateTrainingToolboxInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string,
  files: UploadedFile[] = [],
  removeAttachmentIds: string[] = []
): Promise<Partial<ITrainingToolbox | null>> => {
  const existing = await TrainingToolboxModel.findById(id)
    .select('driverId standAloneId createdBy attachments')
    .lean();
  if (!existing) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existing, accessOwnerId)) {
    return null;
  }

  const effectiveDriverId = (data.driverId || (existing as any).driverId)?.toString();

  if (effectiveDriverId) {
    await validateDriverAndOwner(effectiveDriverId, accessOwnerId);
  }

  const normalizedRemoveIds = Array.from(
    new Set(
      removeAttachmentIds
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => String(item))
    )
  );

  const currentAttachmentIds = Array.isArray((existing as any).attachments)
    ? ((existing as any).attachments as any[]).map((item) => String(item))
    : [];

  const removableAttachmentIds = normalizedRemoveIds.filter((item) =>
    currentAttachmentIds.includes(item)
  );

  if (removableAttachmentIds.length) {
    const documentsToDelete = await DocumentModel.find({
      _id: { $in: removableAttachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)) },
    })
      .select('_id s3Key')
      .lean();

    const keysToDelete = documentsToDelete.map((doc) => doc.s3Key).filter(Boolean);

    if (keysToDelete.length) {
      await deleteObjects(keysToDelete);
    }

    if (documentsToDelete.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documentsToDelete.map((doc) => doc._id) },
      });
    }
  }

  let uploadedDocuments: Awaited<ReturnType<typeof uploadFilesAndCreateDocuments>>['documents'] = [];

  if (files.length) {
    const uploadResult = await uploadFilesAndCreateDocuments(files, String(userId), 'training-toolbox');
    uploadedDocuments = uploadResult.documents;
  }

  const sanitizedData: UpdateTrainingToolboxInput = { ...data };
  delete (sanitizedData as any).attachments;
  delete (sanitizedData as any).removeAttachmentIds;

  try {
    let updatedTrainingToolbox: ITrainingToolbox | null = null;

    if (Object.keys(sanitizedData).length) {
      updatedTrainingToolbox = await TrainingToolboxModel.findByIdAndUpdate(
        id,
        { $set: sanitizedData },
        { new: true }
      );
    }

    if (removableAttachmentIds.length) {
      updatedTrainingToolbox = await TrainingToolboxModel.findByIdAndUpdate(
        id,
        {
          $pull: {
            attachments: {
              $in: removableAttachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)),
            },
          },
        },
        { new: true }
      );
    }

    if (uploadedDocuments.length) {
      updatedTrainingToolbox = await TrainingToolboxModel.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            attachments: {
              $each: uploadedDocuments.map((doc) => doc._id as mongoose.Types.ObjectId),
            },
          },
        },
        { new: true }
      );
    }

    if (!updatedTrainingToolbox) {
      updatedTrainingToolbox = await TrainingToolboxModel.findById(id);
    }

    return updatedTrainingToolbox;
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
};

/**
 * Service function to delete a single training-toolbox by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to delete.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The deleted training-toolbox.
 */
const deleteTrainingToolbox = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<ITrainingToolbox | null>> => {
  const existing = await TrainingToolboxModel.findById(id)
    .select('driverId standAloneId createdBy attachments')
    .lean();
  if (!existing) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existing, accessOwnerId)) {
    return null;
  }

  await validateDriverAndOwner((existing as any).driverId?.toString(), accessOwnerId);

  const attachmentIds = Array.isArray((existing as any).attachments)
    ? ((existing as any).attachments as any[])
      .map((item) => String(item))
      .filter((item) => mongoose.Types.ObjectId.isValid(item))
    : [];

  if (attachmentIds.length) {
    const documents = await DocumentModel.find({
      _id: { $in: attachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)) },
    })
      .select('_id s3Key')
      .lean();

    const s3Keys = documents.map((doc) => doc.s3Key).filter(Boolean);

    if (s3Keys.length) {
      const s3DeleteResult = await deleteObjects(s3Keys);
      if (s3DeleteResult.Errors?.length) {
        throw new Error('Failed to delete one or more training-toolbox attachment files from S3');
      }
    }

    if (documents.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documents.map((doc) => doc._id) },
      });
    }

    await TrainingToolboxModel.updateOne({ _id: (existing as any)._id }, { $set: { attachments: [] } });
  }

  const deletedTrainingToolbox = await TrainingToolboxModel.findByIdAndDelete(id);
  return deletedTrainingToolbox;
};

/**
 * Service function to retrieve a single training-toolbox by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to retrieve.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The retrieved training-toolbox.
 */
const getTrainingToolboxById = async (
  id: IdOrIdsInput['id'],
  requesterId?: IdOrIdsInput['id'],
  standAloneId?: string
): Promise<TrainingToolboxWithAttachmentsResponse | null> => {
  const filter: any = { _id: id };

  if (standAloneId || requesterId) {
    const ownerObjectId = new mongoose.Types.ObjectId(String(standAloneId || requesterId));
    filter.$or = [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }];
  }

  const trainingToolbox = await TrainingToolboxModel.findOne(filter).populate({
    path: 'driverId',
    select: 'fullName',
  });

  if (!trainingToolbox) return null;

  const toolboxObj: any = trainingToolbox.toObject();
  if (toolboxObj.driverId && typeof toolboxObj.driverId === 'object') {
    toolboxObj.driverName = toolboxObj.driverId.fullName || null;
    toolboxObj.driverId = toolboxObj.driverId._id;
  }

  return withSignedAttachmentUrls(toolboxObj);
};

/**
 * Service function to retrieve multiple training-toolbox based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering training-toolbox.
 * @returns {Promise<Partial<ITrainingToolbox>[]>} - The retrieved training-toolbox
 */
const getManyTrainingToolbox = async (
  query: SearchQueryInput & {
    standAloneId?: string;
    requesterId?: string;
    requesterRole?: UserRole;
    createdBy?: string;
  }
): Promise<{
  toolboxes: Partial<ITrainingToolbox>[];
  totalData: number;
  totalPages: number;
}> => {
  const {
    searchKey = '',
    showPerPage = 10,
    pageNo = 1,
    standAloneId,
    requesterId,
    requesterRole,
    createdBy,
  } = query;

  const matchStage: any = {};

  if (searchKey?.trim()) {
    matchStage.$or = [
      { toolboxTitle: { $regex: searchKey, $options: 'i' } },
      { typeOfToolbox: { $regex: searchKey, $options: 'i' } },
      { notes: { $regex: searchKey, $options: 'i' } },
    ];
  }

  let effectiveOwnerId: string | undefined;

  // For standalone users, restrict to their own data. For transport managers, restrict to their own data and any data under the same standAloneId (if provided).
  // if (requesterRole === UserRole.STANDALONE_USER && requesterId) {
  //   effectiveOwnerId = String(requesterId);
  // }

  // if (requesterRole === UserRole.TRANSPORT_MANAGER && standAloneId) {
  //   effectiveOwnerId = String(standAloneId);
  // }

  // if (effectiveOwnerId) {
  //   const ownerObjectId = new mongoose.Types.ObjectId(effectiveOwnerId);

  //   matchStage.$and = matchStage.$and || [];
  //   matchStage.$and.push({
  //     $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  //   });

  //   const accessibleDrivers = await Driver.find({
  //     $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  //   })
  //     .select('_id')
  //     .lean();

  //   const accessibleDriverIds = accessibleDrivers.map((driver) => driver._id);

  //   matchStage.$and.push({ driverId: { $in: accessibleDriverIds }

  // });

  const ownerId = standAloneId || createdBy;
  if (ownerId) {
    const ownerObjectId = new mongoose.Types.ObjectId(String(ownerId));
    matchStage.$or = [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }];
  }

  const skipItems = (pageNo - 1) * showPerPage;

  const result = await TrainingToolboxModel.aggregate([
    { $match: matchStage },
    // Lookup deliveredBy user
    {
      $lookup: {
        from: 'users',
        localField: 'deliveredBy',
        foreignField: '_id',
        as: 'deliveredByUser',
      },
    },
    { $unwind: { path: '$deliveredByUser', preserveNullAndEmptyArrays: true } },
    // Lookup driver for driverName
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driverObj',
      },
    },
    { $unwind: { path: '$driverObj', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        deliveredBy: {
          $cond: [
            { $ifNull: ['$deliveredByUser', false] },
            {
              $concat: ['$deliveredByUser.fullName', ' (', '$deliveredByUser.role', ')'],
            },
            null,
          ],
        },
        driverName: '$driverObj.fullName',
      },
    },
    {
      $project: {
        deliveredByUser: 0,
        driverObj: 0,
      },
    },
    {
      $facet: {
        data: [{ $skip: skipItems }, { $limit: showPerPage }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const toolboxes = result[0].data;
  const totalData = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { toolboxes, totalData, totalPages };
};

export const trainingToolboxServices = {
  createTrainingToolbox,
  updateTrainingToolbox,
  deleteTrainingToolbox,
  getTrainingToolboxById,
  getManyTrainingToolbox,
};
