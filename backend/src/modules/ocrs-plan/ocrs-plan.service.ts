// Import the model
import mongoose from 'mongoose';
import OcrsPlanModel, { IOcrsPlan } from '../../models/compliance-enforcement-dvsa/ocrsPlan.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { UserRole } from '../../models';
import { CreateOcrsPlanInput, UpdateOcrsPlanInput } from './ocrs-plan.validation';

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
  standAloneId?: string
): Promise<Partial<IOcrsPlan | null>> => {
  const existingOcrsPlan = await OcrsPlanModel.findById(id).select('standAloneId createdBy').lean();
  if (!existingOcrsPlan) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingOcrsPlan, accessOwnerId)) {
    return null;
  }

  const updatedOcrsPlan = await OcrsPlanModel.findByIdAndUpdate(id, data, { new: true });
  return updatedOcrsPlan;
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
  const existingOcrsPlan = await OcrsPlanModel.findById(id).select('standAloneId createdBy').lean();
  if (!existingOcrsPlan) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingOcrsPlan, accessOwnerId)) {
    return null;
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
  accessId?: string
): Promise<Partial<IOcrsPlan | null>> => {
  const ocrsPlan = await OcrsPlanModel.findById(id).lean();
  if (!ocrsPlan) return null;
  if (!hasOwnerAccess(ocrsPlan, accessId)) return null;
  return ocrsPlan as any;
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

  if (requesterRole === UserRole.TRANSPORT_MANAGER && requesterId) {
    ownerIds.add(String(requesterId));

    if (standAloneId) {
      ownerIds.add(String(standAloneId));
    }
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

