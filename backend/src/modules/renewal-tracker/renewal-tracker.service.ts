import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  IRenewalTracker,
  PolicyProcedure,
  RenewalTracker,
  UserRole,
} from '../../models';
import {
  CreateRenewalTrackerAsManagerInput,
  CreateRenewalTrackerAsStandAloneInput,
  UpdateRenewalTrackerInput,
} from './renewal-tracker.validation';
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

// Map populated PolicyProcedure references to simple display strings.
const mapPolicyProcedureRefs = (tracker: any) => {
  if (!tracker) return tracker;

  const refOrPolicyNoValue = tracker.refOrPolicyNo;
  const responsiblePersonValue = tracker.responsiblePerson;

  const refOrPolicyNoId =
    refOrPolicyNoValue && typeof refOrPolicyNoValue === 'object'
      ? String(refOrPolicyNoValue._id || '')
      : refOrPolicyNoValue
        ? String(refOrPolicyNoValue)
        : '';

  const responsiblePersonId =
    responsiblePersonValue && typeof responsiblePersonValue === 'object'
      ? String(responsiblePersonValue._id || '')
      : responsiblePersonValue
        ? String(responsiblePersonValue)
        : '';

  const refOrPolicyNoName =
    refOrPolicyNoValue && typeof refOrPolicyNoValue === 'object'
      ? refOrPolicyNoValue.policyName || ''
      : '';

  const responsiblePersonName =
    responsiblePersonValue && typeof responsiblePersonValue === 'object'
      ? responsiblePersonValue.responsiblePerson || ''
      : '';

  return {
    ...tracker,
    refOrPolicyNo: refOrPolicyNoId,
    responsiblePerson: responsiblePersonId,
    refOrPolicyNoName,
    responsiblePersonName,
  };
};

const createRenewalTrackerAsManager = async (
  data: CreateRenewalTrackerAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<Partial<IRenewalTracker>> => {
  const payload: any = { ...data };

  if (payload.refOrPolicyNo) {
    payload.responsiblePerson = payload.refOrPolicyNo;
  }

  await validatePolicyProcedureRefs(payload);
  payload.status = deriveRenewalTrackerStatus(payload);

  const newRenewalTracker = new RenewalTracker(payload);
  return await newRenewalTracker.save();
};

const createRenewalTrackerAsStandAlone = async (
  data: CreateRenewalTrackerAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<Partial<IRenewalTracker>> => {
  const payload: any = { ...data, standAloneId: data.createdBy };

  if (payload.refOrPolicyNo) {
    payload.responsiblePerson = payload.refOrPolicyNo;
  }

  await validatePolicyProcedureRefs(payload);
  payload.status = deriveRenewalTrackerStatus(payload);

  const newRenewalTracker = new RenewalTracker(payload);
  return await newRenewalTracker.save();
};

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

  const ownerIdForScope =
    requesterRole === UserRole.TRANSPORT_MANAGER ? standAloneId : requesterId;

  if (ownerIdForScope) {
    const ownerObjectId = new mongoose.Types.ObjectId(String(ownerIdForScope));
    searchFilter.$and = searchFilter.$and || [];
    searchFilter.$and.push({
      $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
    });
  }

  const skipItems = (pageNo - 1) * showPerPage;
  const totalData = await RenewalTracker.countDocuments(searchFilter);
  const totalPages = Math.ceil(totalData / showPerPage);
  const renewalTrackers = await RenewalTracker.find(searchFilter)
    .populate({ path: 'refOrPolicyNo', select: 'policyName' })
    .populate({ path: 'responsiblePerson', select: 'responsiblePerson' })
    .skip(skipItems)
    .limit(showPerPage)
    .lean();

  const mappedRenewalTrackers = renewalTrackers.map((tracker) => mapPolicyProcedureRefs(tracker));

  return { renewalTrackers: mappedRenewalTrackers as any, totalData, totalPages };
};

const getRenewalTrackerById = async (
  id: IdOrIdsInput['id'],
  accessId: string,
): Promise<Partial<IRenewalTracker | null>> => {
  const ownerObjectId = new mongoose.Types.ObjectId(accessId);
  const renewalTracker = await RenewalTracker.findOne({
    _id: id,
    $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  })
    .populate({ path: 'refOrPolicyNo', select: 'policyName' })
    .populate({ path: 'responsiblePerson', select: 'responsiblePerson' })
    .lean();

  if (!renewalTracker) return null;

  return mapPolicyProcedureRefs(renewalTracker) as any;
};

const updateRenewalTracker = async (
  id: IdOrIdsInput['id'],
  data: UpdateRenewalTrackerInput,
  accessId: string
): Promise<Partial<IRenewalTracker | null>> => {
  const ownerObjectId = new mongoose.Types.ObjectId(accessId);
  const existingRenewalTracker = await RenewalTracker.findOne({
    _id: id,
    $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
  });
  if (!existingRenewalTracker) return null;

  const payload: any = { ...data };

  if (payload.refOrPolicyNo) {
    payload.responsiblePerson = payload.refOrPolicyNo;
  }
  await validatePolicyProcedureRefs(payload);

  const nextStatus = deriveRenewalTrackerStatus({
    startDate: payload.startDate ?? existingRenewalTracker.startDate,
    expiryOrDueDate: payload.expiryOrDueDate ?? existingRenewalTracker.expiryOrDueDate,
    reminderSet: payload.reminderSet ?? existingRenewalTracker.reminderSet,
    reminderDate: payload.reminderDate ?? existingRenewalTracker.reminderDate,
  });
  payload.status = nextStatus;

  const updatedRenewalTracker = await RenewalTracker.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();
  return updatedRenewalTracker as Partial<IRenewalTracker | null>;
};

const deleteRenewalTracker = async (
  id: IdOrIdsInput['id'],
  accessId: string,
): Promise<Partial<IRenewalTracker | null>> => {
    const ownerObjectId = new mongoose.Types.ObjectId(accessId);
    const existingRenewalTracker = await RenewalTracker.findOne({
        _id: id,
        $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
    });
    if (!existingRenewalTracker) return null;
    
    const deletedRenewalTracker = await RenewalTracker.findByIdAndDelete(id).lean();
    return deletedRenewalTracker as Partial<IRenewalTracker | null>;
};

export const renewalTrackerServices = {
  createRenewalTrackerAsManager,
  createRenewalTrackerAsStandAlone,
  getManyRenewalTracker,
  getRenewalTrackerById,
  updateRenewalTracker,
  deleteRenewalTracker,
};
