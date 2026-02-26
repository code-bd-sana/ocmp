// Import the model
import mongoose from 'mongoose';
import RenewalTrackerModel, {
  IRenewalTracker,
} from '../../models/compliance-enforcement-dvsa/renewalTracker.schema';
import PolicyProcedure from '../../models/vehicle-transport/policyProcedure.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { UserRole } from '../../models';
import { CreateRenewalTrackerInput, UpdateRenewalTrackerInput } from './renewal-tracker.validation';
import { deriveRenewalTrackerStatus } from './renewal-tracker.status';

// Validate that the provided refOrPolicyNo and responsiblePerson (if any) are valid PolicyProcedure references
const validatePolicyProcedureRefs = async (data: {
  refOrPolicyNo?: string | mongoose.Types.ObjectId;
  responsiblePerson?: string | mongoose.Types.ObjectId;
}) => {
  const refIds = [data.refOrPolicyNo, data.responsiblePerson].filter(Boolean).map(String);
  if (refIds.length === 0) return;

  const uniqueIds = Array.from(new Set(refIds));
  const count = await PolicyProcedure.countDocuments({ _id: { $in: uniqueIds } });

  if (count !== uniqueIds.length) {
    throw new Error('refOrPolicyNo and responsiblePerson must be valid PolicyProcedure ids');
  }
};

// Check if the user has access to the document based on standAloneId or createdBy
const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

// Map the responsiblePerson field to its policyName if it's populated

const mapResponsiblePersonName = (tracker: any) => {
  if (!tracker) return tracker;

  const responsiblePersonValue = tracker.responsiblePerson;
  if (responsiblePersonValue && typeof responsiblePersonValue === 'object') {
    return {
      ...tracker,
      responsiblePerson: responsiblePersonValue.responsiblePerson || '',
    };
  }

  return {
    ...tracker,
    responsiblePerson: '',
  };
};

/**
 * Service function to create a new renewal-tracker.
 *
 * @param {CreateRenewalTrackerInput} data - The data to create a new renewal-tracker.
 * @returns {Promise<Partial<IRenewalTracker>>} - The created renewal-tracker.
 */
const createRenewalTracker = async (
  data: CreateRenewalTrackerInput
): Promise<Partial<IRenewalTracker>> => {
  await validatePolicyProcedureRefs({
    refOrPolicyNo: (data as any).refOrPolicyNo,
    responsiblePerson: (data as any).responsiblePerson,
  });

  const payload: any = { ...data };
  payload.status = deriveRenewalTrackerStatus({
    startDate: payload.startDate,
    expiryOrDueDate: payload.expiryOrDueDate,
    reminderSet: payload.reminderSet,
    reminderDate: payload.reminderDate,
  });

  const newRenewalTracker = new RenewalTrackerModel(payload);
  const savedRenewalTracker = await newRenewalTracker.save();
  return savedRenewalTracker;
};

/**
 * Service function to update a single renewal-tracker by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to update.
 * @param {UpdateRenewalTrackerInput} data - The updated data for the renewal-tracker.
 * @returns {Promise<Partial<IRenewalTracker>>} - The updated renewal-tracker.
 */
const updateRenewalTracker = async (
  id: IdOrIdsInput['id'],
  data: UpdateRenewalTrackerInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string
): Promise<Partial<IRenewalTracker | null>> => {
  const existingRenewalTracker = await RenewalTrackerModel.findById(id)
    .select('standAloneId createdBy')
    .lean();
  if (!existingRenewalTracker) return null;

  const accessOwnerId = standAloneId || String(userId);
  if (!hasOwnerAccess(existingRenewalTracker, accessOwnerId)) {
    return null;
  }

  await validatePolicyProcedureRefs({
    refOrPolicyNo: data.refOrPolicyNo,
    responsiblePerson: data.responsiblePerson,
  });

  const existingDates = await RenewalTrackerModel.findById(id)
    .select('startDate expiryOrDueDate reminderSet reminderDate')
    .lean();

  const nextStartDate =
    data.startDate !== undefined ? data.startDate : (existingDates as any)?.startDate;
  const nextDueDate =
    data.expiryOrDueDate !== undefined
      ? data.expiryOrDueDate
      : (existingDates as any)?.expiryOrDueDate;
  const nextReminderSet =
    data.reminderSet !== undefined ? data.reminderSet : (existingDates as any)?.reminderSet;
  const nextReminderDate =
    data.reminderDate !== undefined ? data.reminderDate : (existingDates as any)?.reminderDate;

  const payload: any = { ...data };
  payload.status = deriveRenewalTrackerStatus({
    startDate: nextStartDate,
    expiryOrDueDate: nextDueDate,
    reminderSet: nextReminderSet,
    reminderDate: nextReminderDate,
  });

  const updatedRenewalTracker = await RenewalTrackerModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedRenewalTracker;
};

const syncRenewalTrackerStatuses = async (): Promise<number> => {
  const renewalTrackers = await RenewalTrackerModel.find({})
    .select('_id startDate expiryOrDueDate reminderSet reminderDate status')
    .lean();

  let updatedCount = 0;

  for (const tracker of renewalTrackers) {
    const nextStatus = deriveRenewalTrackerStatus({
      startDate: (tracker as any).startDate,
      expiryOrDueDate: (tracker as any).expiryOrDueDate,
      reminderSet: (tracker as any).reminderSet,
      reminderDate: (tracker as any).reminderDate,
    });

    if ((tracker as any).status !== nextStatus) {
      await RenewalTrackerModel.updateOne({ _id: tracker._id }, { $set: { status: nextStatus } });
      updatedCount += 1;
    }
  }

  return updatedCount;
};

/**
 * Service function to delete a single renewal-tracker by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to delete.
 * @returns {Promise<Partial<IRenewalTracker>>} - The deleted renewal-tracker.
 */
const deleteRenewalTracker = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IRenewalTracker | null>> => {
  const existingRenewalTracker = await RenewalTrackerModel.findById(id)
    .select('standAloneId createdBy')
    .lean();
  if (!existingRenewalTracker) return null;

  const accessOwnerId = String(standAloneId || userId);
  if (!hasOwnerAccess(existingRenewalTracker, accessOwnerId)) {
    return null;
  }

  const deletedRenewalTracker = await RenewalTrackerModel.findByIdAndDelete(id);
  return deletedRenewalTracker;
};

/**
 * Service function to retrieve a single renewal-tracker by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the renewal-tracker to retrieve.
 * @returns {Promise<Partial<IRenewalTracker>>} - The retrieved renewal-tracker.
 */
const getRenewalTrackerById = async (
  id: IdOrIdsInput['id'],
  accessId?: string
): Promise<Partial<IRenewalTracker | null>> => {
  const renewalTracker = await RenewalTrackerModel.findById(id)
    .populate({ path: 'responsiblePerson', select: 'responsiblePerson' })
    .lean();
  if (!renewalTracker) return null;
  if (!hasOwnerAccess(renewalTracker, accessId)) return null;
  return mapResponsiblePersonName(renewalTracker) as any;
};

/**
 * Service function to retrieve multiple renewal-tracker based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering renewal-tracker.
 * @returns {Promise<Partial<IRenewalTracker>[]>} - The retrieved renewal-tracker
 */
const getManyRenewalTracker = async (
  query: SearchQueryInput & {
    standAloneId?: string;
    requesterId?: string;
    requesterRole?: UserRole;
  }
): Promise<{
  renewalTrackers: Partial<IRenewalTracker>[];
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

  const searchFilter: any = {};

  if (searchKey?.trim()) {
    searchFilter.$or = [
      { type: { $regex: searchKey, $options: 'i' } },
      { item: { $regex: searchKey, $options: 'i' } },
      { description: { $regex: searchKey, $options: 'i' } },
      { providerOrIssuer: { $regex: searchKey, $options: 'i' } },
      { notes: { $regex: searchKey, $options: 'i' } },
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
  const totalData = await RenewalTrackerModel.countDocuments(searchFilter);
  const totalPages = Math.ceil(totalData / showPerPage);
  const renewalTrackers = await RenewalTrackerModel.find(searchFilter)
    .populate({ path: 'responsiblePerson', select: 'responsiblePerson' })
    .skip(skipItems)
    .limit(showPerPage)
    .lean();

  const mappedRenewalTrackers = renewalTrackers.map((tracker) => mapResponsiblePersonName(tracker));

  return { renewalTrackers: mappedRenewalTrackers as any, totalData, totalPages };
};

export const renewalTrackerServices = {
  createRenewalTracker,
  updateRenewalTracker,
  deleteRenewalTracker,
  getRenewalTrackerById,
  getManyRenewalTracker,
  syncRenewalTrackerStatuses,
};

