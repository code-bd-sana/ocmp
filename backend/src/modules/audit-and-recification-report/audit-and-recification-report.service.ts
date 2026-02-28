// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateAuditAndRecificationReportAsManagerInput,
  CreateAuditAndRecificationReportAsStandAloneInput,
  SearchAuditAndRecificationReportsQueryInput,
  UpdateAuditAndRecificationReportInput,
  UpdateManyAuditAndRecificationReportInput,
} from './audit-and-recification-report.validation';
import AuditsAndRecificationReport, { IAuditsAndRecificationReport } from '../../models/compliance-enforcement-dvsa/auditsAndRecificationReports.schema';


const getAllAuditAndRecificationReport = async (
  query: SearchAuditAndRecificationReportsQueryInput
): Promise<{ AuditAndRecificationReports: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
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

const getAuditAndRecificationReportById = async (
  id: string,
  accessId?: string
): Promise<IAuditsAndRecificationReport> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(id) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [{ createdBy: objectId }, { standAloneId: objectId }];
  }

  const doc = await AuditsAndRecificationReport.findOne(filter);
  console.info('Fetched document for getAuditAndRecificationReportById with filter =======>', filter, 'Result:', doc);
  if (!doc) throw new Error('Audit and recification report not found or access denied');
  return doc;
};

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
    attachments: [], //@TODO: handle attachments
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.auditDate !== undefined) doc.auditDate = data.auditDate;
  if (data.title !== undefined) doc.title = data.title;
  if (data.type !== undefined) doc.type = data.type;
  if (data.auditDetails !== undefined) doc.auditDetails = data.auditDetails;
  if (data.status !== undefined) doc.status = data.status;
  if (data.responsiblePerson !== undefined) doc.responsiblePerson = data.responsiblePerson;
  if (data.finalizeDate !== undefined) doc.finalizeDate = new Date(data.finalizeDate);
  if (data.attachments !== undefined) doc.attachments = data.attachments;

  const newDoc = new AuditsAndRecificationReport(doc);
  return await newDoc.save();
};

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
    attachments: [], //@TODO: handle attachments
    createdBy: data.createdBy,
  };
  if (data.auditDate !== undefined) doc.auditDate = data.auditDate;
  if (data.title !== undefined) doc.title = data.title;
  if (data.type !== undefined) doc.type = data.type;
  if (data.auditDetails !== undefined) doc.auditDetails = data.auditDetails;
  if (data.status !== undefined) doc.status = data.status;
  if (data.responsiblePerson !== undefined) doc.responsiblePerson = data.responsiblePerson;
  if (data.finalizeDate !== undefined) doc.finalizeDate = new Date(data.finalizeDate);
  if (data.attachments !== undefined) doc.attachments = data.attachments;

  const newDoc = new AuditsAndRecificationReport(doc);
  return await newDoc.save();
};

const deleteAuditAndRecificationReport = async (
  id: string,
  accessId: string
): Promise<void> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const deleted = await AuditsAndRecificationReport.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    $or: [{ createdBy: objectId }, { standAloneId: objectId }],
  });

  if (!deleted) throw new Error('Audit and recification report not found or access denied');
};

const updateAuditAndRecificationReport = async (
  id: string,
  data: UpdateAuditAndRecificationReportInput,
  accessId: string
): Promise<IAuditsAndRecificationReport> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const updateFields: Record<string, any> = {};
  if (data.auditDate !== undefined) updateFields.auditDate = new Date(data.auditDate);
  if (data.title !== undefined) updateFields.title = data.title;
  if (data.type !== undefined) updateFields.type = data.type;
  if (data.auditDetails !== undefined) updateFields.auditDetails = data.auditDetails;
  if (data.status !== undefined) updateFields.status = data.status;
  if (data.responsiblePerson !== undefined) updateFields.responsiblePerson = data.responsiblePerson;
  if (data.finalizeDate !== undefined) updateFields.finalizeDate = new Date(data.finalizeDate);
  if (data.attachments !== undefined) updateFields.attachments = data.attachments;

  console.info('Updating audit-and-recification-report with id:', id, 'Update fields:', updateFields, 'Access ID:', accessId);
  const updated = await AuditsAndRecificationReport.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!updated) throw new Error('Audit-and-recification-report not found or access denied');
  return updated;
};

export const auditAndRecificationReportServices = {
  getAllAuditAndRecificationReport,
  getAuditAndRecificationReportById,
  createAuditAndRecificationReportAsManager,
  createAuditAndRecificationReportAsStandAlone,
  updateAuditAndRecificationReport,
  deleteAuditAndRecificationReport,
};