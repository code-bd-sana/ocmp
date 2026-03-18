// Import the model
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import OcrsPlanModel, { IOcrsPlan } from '../../models/compliance-enforcement-dvsa/ocrsPlan.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { UserRole } from '../../models';
import { CreateOcrsPlanInput, UpdateOcrsPlanInput } from './ocrs-plan.validation';
import DocumentModel from '../../models/document.schema';
import { deleteObjects, getSignedDownloadUrl } from '../../utils/aws/s3';
import {
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';

interface OcrsPlanAttachmentResponse {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

type OcrsPlanWithAttachmentsResponse = Omit<Partial<IOcrsPlan>, 'attachments'> & {
  attachments?: OcrsPlanAttachmentResponse[];
};

const withSignedAttachmentUrls = async (
  ocrsPlan: IOcrsPlan | (Partial<IOcrsPlan> & { _id: mongoose.Types.ObjectId })
): Promise<OcrsPlanWithAttachmentsResponse> => {
  const attachmentIds = Array.isArray(ocrsPlan.attachments)
    ? ocrsPlan.attachments
      .map((id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)))
      .filter(Boolean)
    : [];

  if (!attachmentIds.length) {
    return {
      ...(ocrsPlan as Partial<IOcrsPlan>),
      attachments: [],
    } as OcrsPlanWithAttachmentsResponse;
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
      } as OcrsPlanAttachmentResponse;
    })
  );

  const byId = new Map(signedDocuments.map((doc) => [doc._id, doc]));
  const orderedAttachments = attachmentIds
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is OcrsPlanAttachmentResponse => Boolean(doc));

  return {
    ...(ocrsPlan as Partial<IOcrsPlan>),
    attachments: orderedAttachments,
  } as OcrsPlanWithAttachmentsResponse;
};

const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

/**
 * Service function to create a new ocrs-plan.
 *
 * @param {CreateOcrsPlanInput} data - The data to create a new ocrs-plan.
 * @returns {Promise<Partial<IOcrsPlan>>} - The created ocrs-plan.
 */
const createOcrsPlan = async (data: CreateOcrsPlanInput): Promise<Partial<IOcrsPlan>> => {
  const newOcrsPlan = new OcrsPlanModel(data);
  const savedOcrsPlan = await newOcrsPlan.save();
  return savedOcrsPlan;
};

/**
 * Service function to update a single ocrs-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to update.
 * @param {UpdateOcrsPlanInput} data - The updated data for the ocrs-plan.
 * @returns {Promise<Partial<IOcrsPlan>>} - The updated ocrs-plan.
 */
const updateOcrsPlan = async (
  id: IdOrIdsInput['id'],
  data: UpdateOcrsPlanInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string,
  files: UploadedFile[] = [],
  removeAttachmentIds: string[] = []
): Promise<Partial<IOcrsPlan | null>> => {
  const existingOcrsPlan = await OcrsPlanModel.findById(id)
    .select('standAloneId createdBy attachments')
    .lean();
  if (!existingOcrsPlan) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingOcrsPlan, accessOwnerId)) {
    return null;
  }

  const normalizedRemoveIds = Array.from(
    new Set(
      removeAttachmentIds
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => String(item))
    )
  );

  const currentAttachmentIds = Array.isArray(existingOcrsPlan.attachments)
    ? existingOcrsPlan.attachments.map((item) => String(item))
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
    const uploadResult = await uploadFilesAndCreateDocuments(files, String(userId), 'ocrs-plan');
    uploadedDocuments = uploadResult.documents;
  }

  const sanitizedData: UpdateOcrsPlanInput = { ...data };
  delete (sanitizedData as any).attachments;
  delete (sanitizedData as any).removeAttachmentIds;

  try {
    let updatedOcrsPlan: IOcrsPlan | null = null;

    if (Object.keys(sanitizedData).length) {
      updatedOcrsPlan = await OcrsPlanModel.findByIdAndUpdate(id, { $set: sanitizedData }, { new: true });
    }

    if (removableAttachmentIds.length) {
      updatedOcrsPlan = await OcrsPlanModel.findByIdAndUpdate(
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
      updatedOcrsPlan = await OcrsPlanModel.findByIdAndUpdate(
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

    if (!updatedOcrsPlan) {
      updatedOcrsPlan = await OcrsPlanModel.findById(id);
    }

    return updatedOcrsPlan;
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
};

/**
 * Service function to delete a single ocrs-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to delete.
 * @returns {Promise<Partial<IOcrsPlan>>} - The deleted ocrs-plan.
 */
const deleteOcrsPlan = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IOcrsPlan | null>> => {
  const existingOcrsPlan = await OcrsPlanModel.findById(id)
    .select('standAloneId createdBy attachments')
    .lean();
  if (!existingOcrsPlan) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingOcrsPlan, accessOwnerId)) {
    return null;
  }

  const attachmentIds = Array.isArray(existingOcrsPlan.attachments)
    ? existingOcrsPlan.attachments
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
        throw new Error('Failed to delete one or more OCRS attachment files from S3');
      }
    }

    if (documents.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documents.map((doc) => doc._id) },
      });
    }

    await OcrsPlanModel.updateOne({ _id: existingOcrsPlan._id }, { $set: { attachments: [] } });
  }

  const deletedOcrsPlan = await OcrsPlanModel.findByIdAndDelete(id);
  return deletedOcrsPlan;
};

/**
 * Service function to retrieve a single ocrs-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the ocrs-plan to retrieve.
 * @returns {Promise<Partial<IOcrsPlan>>} - The retrieved ocrs-plan.
 */
const getOcrsPlanById = async (
  id: IdOrIdsInput['id'],
  options: {
    requesterId: string;
    requesterRole: UserRole;
    standAloneId?: string;
  }
): Promise<OcrsPlanWithAttachmentsResponse | null> => {
  const ownerIdForScope =
    options.requesterRole === UserRole.TRANSPORT_MANAGER
      ? options.standAloneId
      : options.requesterId;

  if (!ownerIdForScope) return null;

  const ownerObjectId = new mongoose.Types.ObjectId(String(ownerIdForScope));

  const ocrsPlan = await OcrsPlanModel.findOne({
    _id: id,
    $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  }).lean();

  if (!ocrsPlan) return null;

  return withSignedAttachmentUrls(ocrsPlan as Partial<IOcrsPlan> & { _id: mongoose.Types.ObjectId });
};

/**
 * Service function to retrieve multiple ocrs-plan based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering ocrs-plan.
 * @returns {Promise<Partial<IOcrsPlan>[]>} - The retrieved ocrs-plan
 */
const getManyOcrsPlan = async (
  query: SearchQueryInput & {
    standAloneId?: string;
    requesterId?: string;
    requesterRole?: UserRole;
  }
): Promise<{ ocrsPlans: Partial<IOcrsPlan>[]; totalData: number; totalPages: number }> => {
  const {
    searchKey = '',
    showPerPage = 10,
    pageNo = 1,
    standAloneId,
    requesterId,
    requesterRole,
  } = query;

  const searchFilter: any = {};

  if (searchKey?.trim()) {
    searchFilter.$or = [
      { roadWorthinessScore: { $regex: searchKey, $options: 'i' } },
      { overallTrafficScore: { $regex: searchKey, $options: 'i' } },
      { actionRequired: { $regex: searchKey, $options: 'i' } },
      { 'documents.textDoc.label': { $regex: searchKey, $options: 'i' } },
      { 'documents.textDoc.description': { $regex: searchKey, $options: 'i' } },
    ];
  }

  const ownerIds = new Set<string>();

  if (requesterRole === UserRole.STANDALONE_USER && requesterId) {
    ownerIds.add(String(requesterId));
  }

  if (requesterRole === UserRole.TRANSPORT_MANAGER && standAloneId) {
    ownerIds.add(String(standAloneId));
  }

  if (ownerIds.size > 0) {
    const ownerObjectIds = Array.from(ownerIds).map((id) => new mongoose.Types.ObjectId(id));
    searchFilter.$and = searchFilter.$and || [];
    searchFilter.$and.push({
      $or: [{ standAloneId: { $in: ownerObjectIds } }, { createdBy: { $in: ownerObjectIds } }],
    });
  }

  const skipItems = (pageNo - 1) * showPerPage;
  const totalData = await OcrsPlanModel.countDocuments(searchFilter);
  const totalPages = Math.ceil(totalData / showPerPage);
  const ocrsPlans = await OcrsPlanModel.find(searchFilter).skip(skipItems).limit(showPerPage);

  return { ocrsPlans, totalData, totalPages };
};

export const ocrsPlanServices = {
  createOcrsPlan,
  updateOcrsPlan,
  deleteOcrsPlan,
  getOcrsPlanById,
  getManyOcrsPlan,
};
