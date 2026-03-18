// Import the model
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import {
  CreateAuditAndRecificationReportAsManagerInput,
  CreateAuditAndRecificationReportAsStandAloneInput,
  SearchAuditAndRecificationReportsQueryInput,
  UpdateAuditAndRecificationReportInput,
} from './audit-and-recification-report.validation';
import AuditsAndRecificationReport, { IAuditsAndRecificationReport } from '../../models/compliance-enforcement-dvsa/auditsAndRecificationReports.schema';
import DocumentModel from '../../models/document.schema';
import { deleteObjects, getSignedDownloadUrl } from '../../utils/aws/s3';
import {
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';

interface AuditAttachmentResponse {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

type AuditWithAttachmentsResponse = Omit<Partial<IAuditsAndRecificationReport>, 'attachments'> & {
  attachments?: AuditAttachmentResponse[];
};

const withSignedAttachmentUrls = async (
  report:
    | IAuditsAndRecificationReport
    | (Partial<IAuditsAndRecificationReport> & { _id: mongoose.Types.ObjectId })
): Promise<AuditWithAttachmentsResponse> => {
  const attachmentIds = Array.isArray(report.attachments)
    ? report.attachments
      .map((id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)))
      .filter(Boolean)
    : [];

  if (!attachmentIds.length) {
    return {
      ...(report as Partial<IAuditsAndRecificationReport>),
      attachments: [],
    } as AuditWithAttachmentsResponse;
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
      } as AuditAttachmentResponse;
    })
  );

  const byId = new Map(signedDocuments.map((doc) => [doc._id, doc]));
  const orderedAttachments = attachmentIds
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is AuditAttachmentResponse => Boolean(doc));

  return {
    ...(report as Partial<IAuditsAndRecificationReport>),
    attachments: orderedAttachments,
  } as AuditWithAttachmentsResponse;
};

const buildAccessFilter = (accessId: string): Record<string, unknown> => {
  const normalizedId = String(accessId);
  const candidates: Array<string | mongoose.Types.ObjectId> = [normalizedId];

  if (mongoose.Types.ObjectId.isValid(normalizedId)) {
    candidates.unshift(new mongoose.Types.ObjectId(normalizedId));
  }

  return {
    $or: [
      { createdBy: { $in: candidates } },
      { standAloneId: { $in: candidates } },
    ],
  };
};

const toObjectIdArray = (ids?: string[]): mongoose.Types.ObjectId[] | undefined => {
  if (!ids || ids.length === 0) {
    return undefined;
  }

  return ids.map((id) => new mongoose.Types.ObjectId(id));
};

/**
 * Service function to get all audit and recification reports with pagination and optional search by title, type, or responsible person.
 * If standAloneId is provided, it filters reports created by or associated with that standalone user.
 * @param {SearchAuditAndRecificationReportsQueryInput} query - The query parameters for pagination and search
 * @returns {Promise<{ AuditAndRecificationReports: any[]; totalData: number; totalPages: number }>} - The paginated list of reports and metadata
 * @throws {Error} - Throws an error if there is an issue fetching the data
 */
const getAllAuditAndRecificationReport = async (
  query: SearchAuditAndRecificationReportsQueryInput
): Promise<{ AuditAndRecificationReports: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  if (standAloneId) {
    const candidates: Array<string | mongoose.Types.ObjectId> = [standAloneId];
    if (mongoose.Types.ObjectId.isValid(standAloneId)) {
      candidates.unshift(new mongoose.Types.ObjectId(standAloneId));
    }

    basePipeline.push({
      $match: {
        $or: [
          { standAloneId: { $in: candidates } },
          { createdBy: { $in: candidates } },
        ],
      },
    });
  }

  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchKey, $options: 'i' } },
          { type: { $regex: searchKey, $options: 'i' } },
          { responsiblePerson: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await AuditsAndRecificationReport.aggregate([
    ...basePipeline,
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (pageNo - 1) * showPerPage },
          { $limit: showPerPage },
        ],
      },
    },
  ]);

  const totalData = result.metadata[0]?.total ?? 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { AuditAndRecificationReports: result.data, totalData, totalPages };
};

/**
 * Service function to get a single audit and recification report by its ID.
 * If accessId is provided, it checks that the report is either created by or associated with that ID (for standalone users).
 * @param {string} id - The ID of the audit and recification report to retrieve
 * @param {string} [accessId] - Optional ID for access control (matches createdBy or standAloneId)
 * @returns {Promise<IAuditsAndRecificationReport>} - The requested audit and recification report document
 * @throws {Error} - Throws an error if the report is not found or access is denied
 * @info - Logs the filter used and the result for debugging purposes
 */
const getAuditAndRecificationReportById = async (
  id: string,
  accessId?: string
): Promise<AuditWithAttachmentsResponse> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(id) };

  if (accessId) {
    Object.assign(filter, buildAccessFilter(accessId));
  }

  const doc = await AuditsAndRecificationReport.findOne(filter).lean();
  if (!doc) throw new Error('Audit and recification report not found or access denied');
  return withSignedAttachmentUrls(
    doc as Partial<IAuditsAndRecificationReport> & { _id: mongoose.Types.ObjectId }
  );
};

/**
 * Service function to create a new audit and recification report as a manager (TM).
 * The report will be associated with a standalone user via the standAloneId field.
 * @param {CreateAuditAndRecificationReportAsManagerInput & { createdBy: mongoose.Types.ObjectId }} data - The data for the new report, including the creator's ID
 * @returns {Promise<IAuditsAndRecificationReport>} - The created audit and recification report document
 * @throws {Error} - Throws an error if there is an issue creating the report
 */
const createAuditAndRecificationReportAsManager = async (
  data: CreateAuditAndRecificationReportAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IAuditsAndRecificationReport> => {
  const doc: Record<string, any> = {
    auditDate: data.auditDate ? new Date(data.auditDate) : undefined,
    title: data.title,
    type: data.type,
    auditDetails: data.auditDetails,
    status: data.status,
    responsiblePerson: data.responsiblePerson,
    finalizeDate: data.finalizeDate ? new Date(data.finalizeDate) : undefined,
    attachments: toObjectIdArray(data.attachments),
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.auditDate !== undefined) doc.auditDate = new Date(data.auditDate);
  if (data.title !== undefined) doc.title = data.title;
  if (data.type !== undefined) doc.type = data.type;
  if (data.auditDetails !== undefined) doc.auditDetails = data.auditDetails;
  if (data.status !== undefined) doc.status = data.status;
  if (data.responsiblePerson !== undefined) doc.responsiblePerson = data.responsiblePerson;
  if (data.finalizeDate !== undefined) doc.finalizeDate = new Date(data.finalizeDate);
  if (data.attachments !== undefined) doc.attachments = toObjectIdArray(data.attachments);

  const newDoc = new AuditsAndRecificationReport(doc);
  return await newDoc.save();
};

/**
 * Service function to create a new audit and recification report as a standalone user.
 * The report will be associated with the creator's user ID via the createdBy field.
 * @param {CreateAuditAndRecificationReportAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }} data - The data for the new report, including the creator's ID
 * @returns {Promise<IAuditsAndRecificationReport>} - The created audit and recification report document
 * @throws {Error} - Throws an error if there is an issue creating the report
 * @info - Logs the input data for debugging purposes
 */
const createAuditAndRecificationReportAsStandAlone = async (
  data: CreateAuditAndRecificationReportAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IAuditsAndRecificationReport> => {
  const doc: Record<string, any> = {
    auditDate: data.auditDate ? new Date(data.auditDate) : undefined,
    title: data.title,
    type: data.type,
    auditDetails: data.auditDetails,
    status: data.status,
    responsiblePerson: data.responsiblePerson,
    finalizeDate: data.finalizeDate ? new Date(data.finalizeDate) : undefined,
    attachments: toObjectIdArray(data.attachments),
    createdBy: data.createdBy,
  };
  if (data.auditDate !== undefined) doc.auditDate = new Date(data.auditDate);
  if (data.title !== undefined) doc.title = data.title;
  if (data.type !== undefined) doc.type = data.type;
  if (data.auditDetails !== undefined) doc.auditDetails = data.auditDetails;
  if (data.status !== undefined) doc.status = data.status;
  if (data.responsiblePerson !== undefined) doc.responsiblePerson = data.responsiblePerson;
  if (data.finalizeDate !== undefined) doc.finalizeDate = new Date(data.finalizeDate);
  if (data.attachments !== undefined) doc.attachments = toObjectIdArray(data.attachments);

  const newDoc = new AuditsAndRecificationReport(doc);
  return await newDoc.save();
};

/**
 * Service function to delete an audit and recification report by its ID.
 * It checks that the report is either created by or associated with the provided accessId (for standalone users) before deletion.
 * @param {string} id - The ID of the audit and recification report to delete
 * @param {string} accessId - The ID for access control (matches createdBy or standAloneId)
 * @returns {Promise<void>} - Resolves if deletion is successful, otherwise throws an error
 * @throws {Error} - Throws an error if the report is not found or access is denied
 */
const deleteAuditAndRecificationReport = async (
  id: string,
  accessId: string
): Promise<void> => {
  const ownershipFilter = {
    _id: new mongoose.Types.ObjectId(id),
    ...buildAccessFilter(accessId),
  };

  const existingReport = await AuditsAndRecificationReport.findOne(ownershipFilter)
    .select('_id attachments')
    .lean();

  if (!existingReport) throw new Error('Audit and recification report not found or access denied');

  const attachmentIds = Array.isArray(existingReport.attachments)
    ? existingReport.attachments
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
        throw new Error('Failed to delete one or more audit attachment files from S3');
      }
    }

    if (documents.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documents.map((doc) => doc._id) },
      });
    }

    await AuditsAndRecificationReport.updateOne(
      { _id: existingReport._id },
      { $set: { attachments: [] } }
    );
  }

  await AuditsAndRecificationReport.findOneAndDelete(ownershipFilter);
};

/**
 * Service function to update an audit and recification report by its ID.
 * It checks that the report is either created by or associated with the provided accessId (for standalone users) before updating.
 * Only the fields provided in the data object will be updated (PATCH semantics).
 * @param {string} id - The ID of the audit and recification report to update
 * @param {UpdateAuditAndRecificationReportInput} data - The fields to update in the report
 * @param {string} accessId - The ID for access control (matches createdBy or standAloneId)
 * @returns {Promise<IAuditsAndRecificationReport>} - The updated audit and recification report document
 * @throws {Error} - Throws an error if the report is not found or access is denied
 * @info - Logs the update fields and access ID for debugging purposes
 */
const updateAuditAndRecificationReport = async (
  id: string,
  data: UpdateAuditAndRecificationReportInput,
  accessId: string,
  uploaderId: string,
  files: UploadedFile[] = [],
  removeAttachmentIds: string[] = []
): Promise<IAuditsAndRecificationReport> => {
  const ownershipFilter = {
    _id: new mongoose.Types.ObjectId(id),
    ...buildAccessFilter(accessId),
  };

  const existingReport = await AuditsAndRecificationReport.findOne(ownershipFilter)
    .select('_id attachments')
    .lean();

  if (!existingReport) {
    throw new Error('Audit-and-recification-report not found or access denied');
  }

  const normalizedRemoveIds = Array.from(
    new Set(
      removeAttachmentIds
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => String(item))
    )
  );

  const currentAttachmentIds = Array.isArray(existingReport.attachments)
    ? existingReport.attachments.map((item) => String(item))
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
    const uploadResult = await uploadFilesAndCreateDocuments(files, uploaderId, 'audit-and-recification-report');
    uploadedDocuments = uploadResult.documents;
  }

  const updateFields: Record<string, any> = {};
  if (data.auditDate !== undefined) updateFields.auditDate = new Date(data.auditDate);
  if (data.title !== undefined) updateFields.title = data.title;
  if (data.type !== undefined) updateFields.type = data.type;
  if (data.auditDetails !== undefined) updateFields.auditDetails = data.auditDetails;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.responsiblePerson !== undefined) updateFields.responsiblePerson = data.responsiblePerson;
  if (data.finalizeDate !== undefined) updateFields.finalizeDate = new Date(data.finalizeDate);

  let updated: IAuditsAndRecificationReport | null = null;

  try {
    if (Object.keys(updateFields).length) {
      updated = await AuditsAndRecificationReport.findOneAndUpdate(
        ownershipFilter,
        { $set: updateFields },
        { returnDocument: 'after' }
      );
    }

    if (removableAttachmentIds.length) {
      updated = await AuditsAndRecificationReport.findOneAndUpdate(
        ownershipFilter,
        {
          $pull: {
            attachments: {
              $in: removableAttachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)),
            },
          },
        },
        { returnDocument: 'after' }
      );
    }

    if (uploadedDocuments.length) {
      updated = await AuditsAndRecificationReport.findOneAndUpdate(
        ownershipFilter,
        {
          $addToSet: {
            attachments: {
              $each: uploadedDocuments.map((doc) => doc._id as mongoose.Types.ObjectId),
            },
          },
        },
        { returnDocument: 'after' }
      );
    }

    if (!updated) {
      updated = await AuditsAndRecificationReport.findOne(ownershipFilter);
    }
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }

  if (!updated) throw new Error('Audit-and-recification-report not found or access denied');
  return updated;
};

/**
 * Exporting the service functions as an object for use in controllers.
 */
export const auditAndRecificationReportServices = {
  getAllAuditAndRecificationReport,
  getAuditAndRecificationReportById,
  createAuditAndRecificationReportAsManager,
  createAuditAndRecificationReportAsStandAlone,
  updateAuditAndRecificationReport,
  deleteAuditAndRecificationReport,
};
