import mongoose from 'mongoose';
import { PolicyProcedure, IPolicyProcedure } from '../../models';
import {
  CreatePolicyProcedureAsManagerInput,
  CreatePolicyProcedureAsStandAloneInput,
  UpdatePolicyProcedureInput,
  SearchPolicyProceduresQueryInput,
} from './policy-procedure.validation';

// ═══════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Create a policy procedure as a Transport Manager.
 * The TM's createdBy is set in controller; standAloneId comes from body.
 */
const createPolicyProcedureAsManager = async (
  data: CreatePolicyProcedureAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IPolicyProcedure> => {
  const doc: Record<string, any> = {
    policyName: data.policyName,
    policyCategory: data.policyCategory,
    fileLocations: data.fileLocations,
    versionNumber: data.versionNumber,
    effectiveDate: new Date(data.effectiveDate),
    responsiblePerson: data.responsiblePerson,
    reviewStatus: data.reviewStatus,
    type: data.type,
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.reviewFrequencyMonths !== undefined) doc.reviewFrequencyMonths = data.reviewFrequencyMonths;
  if (data.lastReviewDate !== undefined) doc.lastReviewDate = new Date(data.lastReviewDate);
  if (data.notesActionsNeeded !== undefined) doc.notesActionsNeeded = data.notesActionsNeeded;
  if (data.nextReviewDue !== undefined) doc.nextReviewDue = new Date(data.nextReviewDue);

  const newDoc = new PolicyProcedure(doc);
  return await newDoc.save();
};

/**
 * Service: Create a policy procedure as a Standalone User.
 * No standAloneId needed; createdBy is set in controller.
 */
const createPolicyProcedureAsStandAlone = async (
  data: CreatePolicyProcedureAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IPolicyProcedure> => {
  const doc: Record<string, any> = {
    policyName: data.policyName,
    policyCategory: data.policyCategory,
    fileLocations: data.fileLocations,
    versionNumber: data.versionNumber,
    effectiveDate: new Date(data.effectiveDate),
    responsiblePerson: data.responsiblePerson,
    reviewStatus: data.reviewStatus,
    type: data.type,
    createdBy: data.createdBy,
  };
  if (data.reviewFrequencyMonths !== undefined) doc.reviewFrequencyMonths = data.reviewFrequencyMonths;
  if (data.lastReviewDate !== undefined) doc.lastReviewDate = new Date(data.lastReviewDate);
  if (data.notesActionsNeeded !== undefined) doc.notesActionsNeeded = data.notesActionsNeeded;
  if (data.nextReviewDue !== undefined) doc.nextReviewDue = new Date(data.nextReviewDue);

  const newDoc = new PolicyProcedure(doc);
  return await newDoc.save();
};

// ═══════════════════════════════════════════════════════════════
// READ
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all policy procedures (paginated + searchable).
 * Uses aggregation with $or access control and text search.
 */
const getAllPolicyProcedures = async (
  query: SearchPolicyProceduresQueryInput
): Promise<{ policyProcedures: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  // Access control
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    });
  }

  // Search filter on policyName, policyCategory, responsiblePerson
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { policyName: { $regex: searchKey, $options: 'i' } },
          { policyCategory: { $regex: searchKey, $options: 'i' } },
          { responsiblePerson: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await PolicyProcedure.aggregate([
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

  return { policyProcedures: result.data, totalData, totalPages };
};

/**
 * Service: Get a single policy procedure by ID.
 * Uses $or access control on createdBy / standAloneId.
 */
const getPolicyProcedureById = async (
  policyProcedureId: string,
  accessId?: string
): Promise<IPolicyProcedure> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(policyProcedureId) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [{ createdBy: objectId }, { standAloneId: objectId }];
  }

  const doc = await PolicyProcedure.findOne(filter);
  if (!doc) throw new Error('Policy procedure not found or access denied');
  return doc;
};

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Update a policy procedure.
 * Uses $or access control on createdBy / standAloneId.
 */
const updatePolicyProcedure = async (
  policyProcedureId: string,
  data: UpdatePolicyProcedureInput,
  accessId: string
): Promise<IPolicyProcedure> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const updateFields: Record<string, any> = {};
  if (data.policyName !== undefined) updateFields.policyName = data.policyName;
  if (data.policyCategory !== undefined) updateFields.policyCategory = data.policyCategory;
  if (data.fileLocations !== undefined) updateFields.fileLocations = data.fileLocations;
  if (data.versionNumber !== undefined) updateFields.versionNumber = data.versionNumber;
  if (data.effectiveDate !== undefined) updateFields.effectiveDate = new Date(data.effectiveDate);
  if (data.reviewFrequencyMonths !== undefined) updateFields.reviewFrequencyMonths = data.reviewFrequencyMonths;
  if (data.lastReviewDate !== undefined) updateFields.lastReviewDate = new Date(data.lastReviewDate);
  if (data.responsiblePerson !== undefined) updateFields.responsiblePerson = data.responsiblePerson;
  if (data.notesActionsNeeded !== undefined) updateFields.notesActionsNeeded = data.notesActionsNeeded;
  if (data.nextReviewDue !== undefined) updateFields.nextReviewDue = new Date(data.nextReviewDue);
  if (data.reviewStatus !== undefined) updateFields.reviewStatus = data.reviewStatus;
  if (data.type !== undefined) updateFields.type = data.type;

  const updated = await PolicyProcedure.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(policyProcedureId),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!updated) throw new Error('Policy procedure not found or access denied');
  return updated;
};

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Delete a policy procedure.
 * Uses $or access control on createdBy / standAloneId.
 */
const deletePolicyProcedure = async (
  policyProcedureId: string,
  accessId: string
): Promise<void> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const deleted = await PolicyProcedure.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(policyProcedureId),
    $or: [{ createdBy: objectId }, { standAloneId: objectId }],
  });

  if (!deleted) throw new Error('Policy procedure not found or access denied');
};

export const policyProcedureServices = {
  createPolicyProcedureAsManager,
  createPolicyProcedureAsStandAlone,
  getAllPolicyProcedures,
  getPolicyProcedureById,
  updatePolicyProcedure,
  deletePolicyProcedure,
};