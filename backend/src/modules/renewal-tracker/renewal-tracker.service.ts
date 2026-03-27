import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { IRenewalTracker, PolicyProcedure, RenewalTracker, User, UserRole } from '../../models';
import {
  CreateRenewalTrackerAsManagerInput,
  CreateRenewalTrackerAsStandAloneInput,
  UpdateRenewalTrackerInput,
} from './renewal-tracker.validation';
import { deriveRenewalTrackerStatus } from './renewal-tracker.status';
import SendEmail from '../../utils/email/send-email';

const getStartOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const formatDate = (value?: Date | string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toISOString().slice(0, 10);
};

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

  const ownerIdForScope = requesterRole === UserRole.TRANSPORT_MANAGER ? standAloneId : requesterId;

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
  accessId: string
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
  accessId: string
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

const syncRenewalTrackerStatus = async (): Promise<{
  updatedStatusCount: number;
  reminderEmailSentCount: number;
}> => {
  const trackers = await RenewalTracker.find({
    $or: [
      { startDate: { $exists: true } },
      { expiryOrDueDate: { $exists: true } },
      { reminderDate: { $exists: true } },
    ],
  })
    .select(
      '_id type item startDate expiryOrDueDate reminderSet reminderDate status standAloneId createdBy lastReminderEmailSentAt'
    )
    .lean();

  const statusBulkUpdates = trackers
    .map((tracker) => {
      const nextStatus = deriveRenewalTrackerStatus({
        startDate: tracker.startDate,
        expiryOrDueDate: tracker.expiryOrDueDate,
        reminderSet: Boolean(tracker.reminderSet),
        reminderDate: tracker.reminderDate,
      });

      if (tracker.status === nextStatus) return null;
      return {
        updateOne: {
          filter: { _id: tracker._id },
          update: { $set: { status: nextStatus } },
        },
      };
    })
    .filter(Boolean);

  let updatedStatusCount = 0;
  if (statusBulkUpdates.length > 0) {
    const statusUpdateResult = await RenewalTracker.bulkWrite(statusBulkUpdates as any);
    updatedStatusCount = statusUpdateResult.modifiedCount;
  }

  const startOfToday = getStartOfToday();
  const endOfToday = getEndOfToday();

  const dueReminderTrackers = await RenewalTracker.find({
    reminderSet: true,
    reminderDate: { $gte: startOfToday, $lte: endOfToday },
    $or: [
      { lastReminderEmailSentAt: { $exists: false } },
      { lastReminderEmailSentAt: { $lt: startOfToday } },
    ],
  })
    .select(
      '_id type item expiryOrDueDate reminderDate standAloneId createdBy providerOrIssuer description notes'
    )
    .lean();

  if (dueReminderTrackers.length === 0) {
    return { updatedStatusCount, reminderEmailSentCount: 0 };
  }

  const ownerIds = Array.from(
    new Set(
      dueReminderTrackers
        .map((tracker) => String(tracker.standAloneId || tracker.createdBy || ''))
        .filter(Boolean)
    )
  );

  const owners = await User.find({ _id: { $in: ownerIds } })
    .select('_id fullName email')
    .lean();
  const ownerMap = new Map(owners.map((owner) => [String(owner._id), owner]));

  const successfulReminderIds: mongoose.Types.ObjectId[] = [];

  for (const tracker of dueReminderTrackers) {
    const ownerId = String(tracker.standAloneId || tracker.createdBy || '');
    const owner = ownerMap.get(ownerId);

    if (!owner?.email) continue;

    const subject = `Renewal Reminder: ${tracker.item}`;
    const text = [
      `Hello ${owner.fullName || 'User'},`,
      '',
      `This is your reminder for renewal tracker item "${tracker.item}" (${tracker.type}).`,
      `Reminder date: ${formatDate(tracker.reminderDate)}`,
      `Expiry/Due date: ${formatDate(tracker.expiryOrDueDate)}`,
      tracker.providerOrIssuer ? `Provider/Issuer: ${tracker.providerOrIssuer}` : '',
      tracker.description ? `Description: ${tracker.description}` : '',
      tracker.notes ? `Notes: ${tracker.notes}` : '',
      '',
      'Please review and take action if needed.',
    ]
      .filter(Boolean)
      .join('\n');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hello ${owner.fullName || 'User'},</p>
        <p>This is your reminder for renewal tracker item <strong>${tracker.item}</strong> (${tracker.type}).</p>
        <table style="border-collapse: collapse; margin: 8px 0;">
          <tr><td style="padding: 4px 8px; font-weight: 600;">Reminder date</td><td style="padding: 4px 8px;">${formatDate(tracker.reminderDate)}</td></tr>
          <tr><td style="padding: 4px 8px; font-weight: 600;">Expiry/Due date</td><td style="padding: 4px 8px;">${formatDate(tracker.expiryOrDueDate)}</td></tr>
          ${tracker.providerOrIssuer ? `<tr><td style="padding: 4px 8px; font-weight: 600;">Provider/Issuer</td><td style="padding: 4px 8px;">${tracker.providerOrIssuer}</td></tr>` : ''}
          ${tracker.description ? `<tr><td style="padding: 4px 8px; font-weight: 600;">Description</td><td style="padding: 4px 8px;">${tracker.description}</td></tr>` : ''}
          ${tracker.notes ? `<tr><td style="padding: 4px 8px; font-weight: 600;">Notes</td><td style="padding: 4px 8px;">${tracker.notes}</td></tr>` : ''}
        </table>
        <p>Please review and take action if needed.</p>
      </div>
    `;

    const isSent = await SendEmail({
      to: owner.email,
      subject,
      text,
      html,
    });

    if (isSent) {
      successfulReminderIds.push(new mongoose.Types.ObjectId(String(tracker._id)));
    }
  }

  if (successfulReminderIds.length > 0) {
    await RenewalTracker.updateMany(
      { _id: { $in: successfulReminderIds } },
      { $set: { lastReminderEmailSentAt: new Date() } }
    );
  }

  return {
    updatedStatusCount,
    reminderEmailSentCount: successfulReminderIds.length,
  };
};

export const renewalTrackerServices = {
  createRenewalTrackerAsManager,
  createRenewalTrackerAsStandAlone,
  getManyRenewalTracker,
  getRenewalTrackerById,
  updateRenewalTracker,
  deleteRenewalTracker,
  syncRenewalTrackerStatus,
};
