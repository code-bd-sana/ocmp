// Import the model
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import SpotCheckModel, {
  ISpotCheck,
} from '../../models/compliance-enforcement-dvsa/spotCheck.schema';
import Vehicle from '../../models/vehicle-transport/vehicle.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import DocumentModel from '../../models/document.schema';
import { deleteObjects, getSignedDownloadUrl } from '../../utils/aws/s3';
import {
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';
import {
  CreateSpotCheckInput,
  CreateSpotCheckAsManagerInput,
  CreateSpotCheckAsStandAloneInput,
  UpdateSpotCheckInput,
} from './spot-check.validation';

interface SpotCheckAttachmentResponse {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

type SpotCheckWithAttachmentsResponse = Omit<Partial<ISpotCheck>, 'attachments'> & {
  attachments?: SpotCheckAttachmentResponse[];
};

const withSignedAttachmentUrls = async (
  spotCheck: ISpotCheck | (Partial<ISpotCheck> & { _id: mongoose.Types.ObjectId })
): Promise<SpotCheckWithAttachmentsResponse> => {
  const attachmentIds = Array.isArray(spotCheck.attachments)
    ? spotCheck.attachments
      .map((id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)))
      .filter(Boolean)
    : [];

  if (!attachmentIds.length) {
    return {
      ...(spotCheck as Partial<ISpotCheck>),
      attachments: [],
    } as SpotCheckWithAttachmentsResponse;
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
      } as SpotCheckAttachmentResponse;
    })
  );

  const byId = new Map(signedDocuments.map((doc) => [doc._id, doc]));
  const orderedAttachments = attachmentIds
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is SpotCheckAttachmentResponse => Boolean(doc));

  return {
    ...(spotCheck as Partial<ISpotCheck>),
    attachments: orderedAttachments,
  } as SpotCheckWithAttachmentsResponse;
};

const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

/**
 * Service function to create a new spot-check.
 *
 * @param {CreateSpotCheckInput} data - The data to create a new spot-check.
 * @returns {Promise<Partial<ISpotCheck>>} - The created spot-check.
 */
const createSpotCheck = async (data: CreateSpotCheckInput): Promise<Partial<ISpotCheck>> => {
  const newSpotCheck = new SpotCheckModel(data);
  const savedSpotCheck = await newSpotCheck.save();
  return savedSpotCheck;
};

const createSpotCheckAsManager = async (
  data: CreateSpotCheckAsManagerInput
): Promise<Partial<ISpotCheck>> => {
  // verify vehicle exists
  const vehicle = await Vehicle.findById(data.vehicleId).lean();
  if (!vehicle) throw new Error('Vehicle does not exist');

  // owner can be standAloneId or createdBy
  const ownerId = vehicle.standAloneId
    ? vehicle.standAloneId.toString()
    : vehicle.createdBy.toString();
  if (String(data.standAloneId) !== ownerId) {
    throw new Error('Stand-alone user does not exist under this vehicle');
  }

  const newSpotCheck = new SpotCheckModel(data as any);
  const savedSpotCheck = await newSpotCheck.save();
  return savedSpotCheck;
};

const createSpotCheckAsStandAlone = async (
  data: CreateSpotCheckAsStandAloneInput
): Promise<Partial<ISpotCheck>> => {
  // verify vehicle exists
  const vehicle = await Vehicle.findById(data.vehicleId).lean();
  if (!vehicle) throw new Error('Vehicle does not exist');

  const ownerId = vehicle.standAloneId
    ? vehicle.standAloneId.toString()
    : vehicle.createdBy.toString();
  // createdBy must match ownerId (standalone user can only create for their own vehicles)
  if (String(data.createdBy) !== ownerId) {
    throw new Error('You are not the owner of this vehicle');
  }

  const newSpotCheck = new SpotCheckModel(data as any);
  const savedSpotCheck = await newSpotCheck.save();
  return savedSpotCheck;
};

/**
 * Service function to update a single spot-check by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to update.
 * @param {UpdateSpotCheckInput} data - The updated data for the spot-check.
 * @returns {Promise<Partial<ISpotCheck>>} - The updated spot-check.
 */
const updateSpotCheck = async (
  id: IdOrIdsInput['id'],
  data: UpdateSpotCheckInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string,
  files: UploadedFile[] = [],
  removeAttachmentIds: string[] = []
): Promise<Partial<ISpotCheck | null>> => {
  const existingSpotCheck = await SpotCheckModel.findById(id)
    .select('standAloneId createdBy attachments')
    .lean();

  if (!existingSpotCheck) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingSpotCheck, accessOwnerId)) {
    return null;
  }

  const normalizedRemoveIds = Array.from(
    new Set(
      removeAttachmentIds
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => String(item))
    )
  );

  const currentAttachmentIds = Array.isArray(existingSpotCheck.attachments)
    ? existingSpotCheck.attachments.map((item) => String(item))
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
    const uploadResult = await uploadFilesAndCreateDocuments(files, String(userId), 'spot-check');
    uploadedDocuments = uploadResult.documents;
  }

  const sanitizedData: UpdateSpotCheckInput = { ...data };
  delete (sanitizedData as any).attachments;
  delete (sanitizedData as any).removeAttachmentIds;

  try {
    let updatedSpotCheck: ISpotCheck | null = null;

    if (Object.keys(sanitizedData).length) {
      updatedSpotCheck = await SpotCheckModel.findByIdAndUpdate(id, { $set: sanitizedData }, { new: true });
    }

    if (removableAttachmentIds.length) {
      updatedSpotCheck = await SpotCheckModel.findByIdAndUpdate(
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
      updatedSpotCheck = await SpotCheckModel.findByIdAndUpdate(
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

    if (!updatedSpotCheck) {
      updatedSpotCheck = await SpotCheckModel.findById(id);
    }

    return updatedSpotCheck;
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
};

/**
 * Service function to delete a single spot-check by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to delete.
 * @returns {Promise<Partial<ISpotCheck>>} - The deleted spot-check.
 */
const deleteSpotCheck = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<ISpotCheck | null>> => {
  const existingSpotCheck = await SpotCheckModel.findById(id)
    .select('standAloneId createdBy attachments')
    .lean();

  if (!existingSpotCheck) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingSpotCheck, accessOwnerId)) {
    return null;
  }

  const attachmentIds = Array.isArray(existingSpotCheck.attachments)
    ? existingSpotCheck.attachments
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
        throw new Error('Failed to delete one or more spot-check attachment files from S3');
      }
    }

    if (documents.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documents.map((doc) => doc._id) },
      });
    }

    await SpotCheckModel.updateOne({ _id: existingSpotCheck._id }, { $set: { attachments: [] } });
  }

  const deletedSpotCheck = await SpotCheckModel.findByIdAndDelete(id);
  return deletedSpotCheck;
};

/**
 * Service function to retrieve a single spot-check by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to retrieve.
 * @returns {Promise<Partial<ISpotCheck>>} - The retrieved spot-check.
 */
const getSpotCheckById = async (
  id: IdOrIdsInput['id'],
  accessId?: string
): Promise<SpotCheckWithAttachmentsResponse | null> => {
  const spotCheck = await SpotCheckModel.findById(id).lean();
  if (!spotCheck) return null;
  if (accessId) {
    const accessIdStr = String(accessId);
    const ownerMatch =
      (spotCheck as any).standAloneId?.toString?.() === accessIdStr ||
      (spotCheck as any).createdBy?.toString?.() === accessIdStr;
    if (!ownerMatch) return null;
  }
  return withSignedAttachmentUrls(spotCheck as Partial<ISpotCheck> & { _id: mongoose.Types.ObjectId });
};

/**
 * Service function to retrieve multiple spot-check based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering spot-check.
 * @returns {Promise<Partial<ISpotCheck>[]>} - The retrieved spot-check
 */
// const getManySpotCheck = async (
//   query: SearchQueryInput
// ): Promise<{ spotChecks: Partial<ISpotCheck>[]; totalData: number; totalPages: number }> => {
//   const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query as any;
//   const skipItems = (pageNo - 1) * showPerPage;

//   const baseOr: any[] = [];
//   // Add searchable fields here if needed

//   const searchFilter: any = {};
//   if (baseOr.length > 0) searchFilter.$or = baseOr;

//   // If standAloneId filter is present, restrict to docs where createdBy OR standAloneId matches
//   if (standAloneId) {
//     searchFilter.$and = searchFilter.$and || [];
//     searchFilter.$and.push({
//       $or: [
//         { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
//         { createdBy: new mongoose.Types.ObjectId(standAloneId) },
//       ],
//     });
//   }

//   const totalData = await SpotCheckModel.countDocuments(searchFilter);
//   const totalPages = Math.ceil(totalData / showPerPage);
//   const spotChecks = await SpotCheckModel.find(searchFilter).skip(skipItems).limit(showPerPage);
//   return { spotChecks, totalData, totalPages };
// };

// ...existing code...

const getManySpotCheck = async (
  query: SearchQueryInput & { createdBy?: string; standAloneId?: string }
): Promise<{ spotChecks: Partial<ISpotCheck>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query;
  const skipItems = (pageNo - 1) * showPerPage;

  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  // Search filter
  if (searchKey) {
    searchConditions.push({
      $or: [
        { driverName: { $regex: searchKey, $options: 'i' } },
        { vehicleReg: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  // A spot-check belongs to an SA user if EITHER:
  //   a) standAloneId = SA_id  (created by TM on behalf of SA user)
  //   b) createdBy   = SA_id  (created by SA user themselves)
  const ownerId = standAloneId || createdBy;
  if (ownerId) {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    andConditions.push({
      $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
    });
  }

  // Final filter build
  const finalFilter: any = {};

  if (searchConditions.length) {
    finalFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    finalFilter.$and = [...(finalFilter.$and || []), ...andConditions];
  }

  const totalData = await SpotCheckModel.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalData / showPerPage);
  const spotChecks = await SpotCheckModel.find(finalFilter).skip(skipItems).limit(showPerPage);
  return { spotChecks, totalData, totalPages };
};

export const spotCheckServices = {
  createSpotCheck,
  createSpotCheckAsManager,
  createSpotCheckAsStandAlone,
  updateSpotCheck,
  deleteSpotCheck,
  getSpotCheckById,
  getManySpotCheck,
};
