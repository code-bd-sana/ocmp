import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import TrafficCommissionerCommunicationModel, {
  ITrafficCommissionerCommunication,
} from '../../models/compliance-enforcement-dvsa/trafficCommissionerCommunication.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import DocumentModel from '../../models/document.schema';
import { deleteObjects, getSignedDownloadUrl } from '../../utils/aws/s3';
import {
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';
import {
  CreateTrafficCommissionerCommunicationAsStandAloneInput,
  CreateTrafficCommissionerCommunicationAsTransportManagerInput,
  UpdateTrafficCommissionerCommunicationInput,
} from './traffic-commissioner-communication.validation';

interface TrafficCommissionerAttachmentResponse {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

type TrafficCommissionerWithAttachmentsResponse = Omit<
  Partial<ITrafficCommissionerCommunication>,
  'attachments'
> & {
  attachments?: TrafficCommissionerAttachmentResponse[];
};

const withSignedAttachmentUrls = async (
  communication:
    | ITrafficCommissionerCommunication
    | (Partial<ITrafficCommissionerCommunication> & { _id: mongoose.Types.ObjectId })
): Promise<TrafficCommissionerWithAttachmentsResponse> => {
  const attachmentIds = Array.isArray(communication.attachments)
    ? communication.attachments
      .map((id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)))
      .filter(Boolean)
    : [];

  if (!attachmentIds.length) {
    return {
      ...(communication as Partial<ITrafficCommissionerCommunication>),
      attachments: [],
    } as TrafficCommissionerWithAttachmentsResponse;
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
        // Fallback to stored URL if signed URL generation fails.
      }

      return {
        _id: String(doc._id),
        filename: doc.filename,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        url: doc.url,
        downloadUrl,
      } as TrafficCommissionerAttachmentResponse;
    })
  );

  const byId = new Map(signedDocuments.map((doc) => [doc._id, doc]));
  const orderedAttachments = attachmentIds
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is TrafficCommissionerAttachmentResponse => Boolean(doc));

  return {
    ...(communication as Partial<ITrafficCommissionerCommunication>),
    attachments: orderedAttachments,
  } as TrafficCommissionerWithAttachmentsResponse;
};

const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

/**
 * Service function to create a new traffic-commissioner-communication as a Transport Manager.
 *
 * @param {CreateTrafficCommissionerCommunicationAsTransportManagerInput} data - The data to create a new communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The created traffic-commissioner-communication.
 */
const createTrafficCommissionerCommunicationAsTransportManager = async (
  data: CreateTrafficCommissionerCommunicationAsTransportManagerInput
): Promise<Partial<ITrafficCommissionerCommunication>> => {
  const newTrafficCommissionerCommunication = new TrafficCommissionerCommunicationModel(data);
  const savedTrafficCommissionerCommunication = await newTrafficCommissionerCommunication.save();
  return savedTrafficCommissionerCommunication;
};

/**
 * Service function to create a new traffic-commissioner-communication as a Stand-alone User.
 *
 * @param {CreateTrafficCommissionerCommunicationAsStandAloneInput} data - The data to create a new communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The created traffic-commissioner-communication.
 */
const createTrafficCommissionerCommunicationAsStandAlone = async (
  data: CreateTrafficCommissionerCommunicationAsStandAloneInput
): Promise<Partial<ITrafficCommissionerCommunication>> => {
  const newTrafficCommissionerCommunication = new TrafficCommissionerCommunicationModel(data);
  const savedTrafficCommissionerCommunication = await newTrafficCommissionerCommunication.save();
  return savedTrafficCommissionerCommunication;
};

/**
 * Service function to update a single traffic-commissioner-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to update.
 * @param {UpdateTrafficCommissionerCommunicationInput} data - The updated data for the traffic-commissioner-communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The updated traffic-commissioner-communication.
 */
const updateTrafficCommissionerCommunication = async (
  id: IdOrIdsInput['id'],
  data: UpdateTrafficCommissionerCommunicationInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string,
  files: UploadedFile[] = [],
  removeAttachmentIds: string[] = []
): Promise<Partial<ITrafficCommissionerCommunication | null>> => {
  const existingTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findById(id)
      .select('standAloneId createdBy attachments')
      .lean();
  if (!existingTrafficCommissionerCommunication) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingTrafficCommissionerCommunication, accessOwnerId)) {
    return null;
  }

  const normalizedRemoveIds = Array.from(
    new Set(
      removeAttachmentIds
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => String(item))
    )
  );

  const currentAttachmentIds = Array.isArray(existingTrafficCommissionerCommunication.attachments)
    ? existingTrafficCommissionerCommunication.attachments.map((item) => String(item))
    : [];

  const removableAttachmentIds = normalizedRemoveIds.filter((item) =>
    currentAttachmentIds.includes(item)
  );

  if (removableAttachmentIds.length) {
    const documentsToDelete = await DocumentModel.find({
      _id: {
        $in: removableAttachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)),
      },
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
    const uploadResult = await uploadFilesAndCreateDocuments(
      files,
      String(userId),
      'traffic-commissioner-communication'
    );
    uploadedDocuments = uploadResult.documents;
  }

  const sanitizedData: UpdateTrafficCommissionerCommunicationInput = { ...data };
  delete (sanitizedData as any).attachments;
  delete (sanitizedData as any).removeAttachmentIds;

  try {
    let updatedTrafficCommissionerCommunication: ITrafficCommissionerCommunication | null = null;

    if (Object.keys(sanitizedData).length) {
      updatedTrafficCommissionerCommunication =
        await TrafficCommissionerCommunicationModel.findByIdAndUpdate(
          id,
          { $set: sanitizedData },
          { new: true }
        );
    }

    if (removableAttachmentIds.length) {
      updatedTrafficCommissionerCommunication =
        await TrafficCommissionerCommunicationModel.findByIdAndUpdate(
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
      updatedTrafficCommissionerCommunication =
        await TrafficCommissionerCommunicationModel.findByIdAndUpdate(
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

    if (!updatedTrafficCommissionerCommunication) {
      updatedTrafficCommissionerCommunication = await TrafficCommissionerCommunicationModel.findById(id);
    }

    return updatedTrafficCommissionerCommunication;
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
};

/**
 * Service function to delete a single traffic-commissioner-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to delete.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The deleted traffic-commissioner-communication.
 */
const deleteTrafficCommissionerCommunication = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<ITrafficCommissionerCommunication | null>> => {
  const existingTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findById(id)
      .select('standAloneId createdBy attachments')
      .lean();
  if (!existingTrafficCommissionerCommunication) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingTrafficCommissionerCommunication, accessOwnerId)) {
    return null;
  }

  const attachmentIds = Array.isArray(existingTrafficCommissionerCommunication.attachments)
    ? existingTrafficCommissionerCommunication.attachments
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
        throw new Error('Failed to delete one or more communication attachment files from S3');
      }
    }

    if (documents.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documents.map((doc) => doc._id) },
      });
    }

    await TrafficCommissionerCommunicationModel.updateOne(
      { _id: existingTrafficCommissionerCommunication._id },
      { $set: { attachments: [] } }
    );
  }

  const deletedTrafficCommissionerCommunication =
    await TrafficCommissionerCommunicationModel.findByIdAndDelete(id);
  return deletedTrafficCommissionerCommunication;
};

/**
 * Service function to retrieve a single traffic-commissioner-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to retrieve.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>>} - The retrieved traffic-commissioner-communication.
 */
const getTrafficCommissionerCommunicationById = async (
  id: IdOrIdsInput['id'],
  options?: {
    requesterId?: string;
    requesterRole?: string;
    standAloneId?: string;
  }
): Promise<TrafficCommissionerWithAttachmentsResponse | null> => {
  const { requesterId, standAloneId } = options || {};
  const ownerObjectId = standAloneId
    ? new mongoose.Types.ObjectId(standAloneId)
    : requesterId
      ? new mongoose.Types.ObjectId(requesterId)
      : undefined;

  if (!ownerObjectId) {
    const communication = await TrafficCommissionerCommunicationModel.findById(id).lean();
    if (!communication) return null;
    return withSignedAttachmentUrls(
      communication as Partial<ITrafficCommissionerCommunication> & { _id: mongoose.Types.ObjectId }
    );
  }

  const trafficCommissionerCommunication = await TrafficCommissionerCommunicationModel.findOne({
    _id: id,
    $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  }).lean();

  if (!trafficCommissionerCommunication) return null;

  return withSignedAttachmentUrls(
    trafficCommissionerCommunication as Partial<ITrafficCommissionerCommunication> & {
      _id: mongoose.Types.ObjectId;
    }
  );
};

/**
 * Service function to retrieve multiple traffic-commissioner-communication based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering traffic-commissioner-communication.
 * @returns {Promise<Partial<ITrafficCommissionerCommunication>[]>} - The retrieved traffic-commissioner-communication
 */
const getManyTrafficCommissionerCommunication = async (
  query: SearchQueryInput & { standAloneId?: string; requesterId?: string; requesterRole?: string }
): Promise<{
  trafficCommissionerCommunications: Partial<ITrafficCommissionerCommunication>[];
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
  } = query;
  const searchFilter = searchKey
    ? {
        $or: [
          { type: { $regex: searchKey, $options: 'i' } },
          { contactedPerson: { $regex: searchKey, $options: 'i' } },
          { reason: { $regex: searchKey, $options: 'i' } },
        ],
      }
    : {};

  const filter: any = { ...searchFilter };

  // Build owner filter based on role
  const ownerIds = new Set<string>();

  if (requesterRole === 'TRANSPORT_MANAGER' && standAloneId) {
    ownerIds.add(String(standAloneId));
  } else if (requesterId) {
    ownerIds.add(String(requesterId));
  }

  if (ownerIds.size > 0) {
    const ownerObjectIds = Array.from(ownerIds).map((id) => new mongoose.Types.ObjectId(id));
    const ownerFilter = {
      $or: [{ standAloneId: { $in: ownerObjectIds } }, { createdBy: { $in: ownerObjectIds } }],
    };

    if (Object.keys(searchFilter).length > 0) {
      Object.assign(filter, { $and: [searchFilter, ownerFilter] });
      delete filter.$or;
    } else {
      Object.assign(filter, ownerFilter);
    }
  }

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching traffic-commissioner-communication
  const totalData = await TrafficCommissionerCommunicationModel.countDocuments(filter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find traffic-commissioner-communications based on the search filter with pagination
  const trafficCommissionerCommunications = await TrafficCommissionerCommunicationModel.find(filter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { trafficCommissionerCommunications, totalData, totalPages };
};

export const trafficCommissionerCommunicationServices = {
  createTrafficCommissionerCommunicationAsTransportManager,
  createTrafficCommissionerCommunicationAsStandAlone,
  updateTrafficCommissionerCommunication,
  deleteTrafficCommissionerCommunication,
  getTrafficCommissionerCommunicationById,
  getManyTrafficCommissionerCommunication,
};
