// Import the model
import mongoose from 'mongoose';

import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreatePlannerAsManagerInput,
  CreatePlannerAsStandAloneInput,
  RequestChangePlannerDateInput,
  UpdatePlannerAsManagerInput,
} from './planner.validation';
import {
  ClientManagement,
  ClientStatus,
  IPlanner,
  RequestStatus,
  Planner,
  PlannerStatus,
} from '../../models';
import Notification, { NotificationType } from '../../models/notification.schema';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import NotificationSchema from '../../models/notification.schema';

// Helper function to check if the user has access to the document based on ownership`
const hasOwnerAccess = (doc: any, accessId?: string) => {
  if (!accessId) return true;
  const accessIdStr = String(accessId);
  return (
    doc?.standAloneId?.toString?.() === accessIdStr || doc?.createdBy?.toString?.() === accessIdStr
  );
};

/**
 * Service function to create a new planner as Transport Manager
 *
 * @param {CreatePlannerInput} data - The data to create a new planner as Transport Manager
 * @returns {Promise<Partial<IPlanner>>} - The created planner
 * @throws {Error} - Throws an error if the planner creation fails
 */
const createPlannerAsManager = async (
  data: CreatePlannerAsManagerInput
): Promise<Partial<IPlanner>> => {
  // Prevent duplicates for the same plannerType & plannerDate for the same owner
  // Owner can be either the standAloneId (client) or the creator (manager)
  const ownerFilters: any[] = [];
  if ((data as any).standAloneId) {
    ownerFilters.push({ standAloneId: new mongoose.Types.ObjectId((data as any).standAloneId) });
  }
  if ((data as any).createdBy) {
    ownerFilters.push({ createdBy: new mongoose.Types.ObjectId((data as any).createdBy) });
  }

  let checkDuplicate: any = null;
  const baseDupQuery: any = {
    plannerType: data.plannerType,
    plannerDate: data.plannerDate,
  };

  if (ownerFilters.length > 0) {
    checkDuplicate = await Planner.findOne({ ...baseDupQuery, $or: ownerFilters }).lean();
  } else {
    checkDuplicate = await Planner.findOne(baseDupQuery).lean();
  }

  if (checkDuplicate) {
    throw new Error('A planner with the same planner type and date already exists for this owner.');
  }

  const newPlanner = new Planner(data as any);
  const savedPlanner = await newPlanner.save();
  return savedPlanner;
};

/**
 * Service function to create a new planner as Standalone User
 *
 * @param {CreatePlannerInput} data - The data to create a new planner as Standalone User
 * @returns {Promise<Partial<IPlanner>>} - The created planner
 * @throws {Error} - Throws an error if the planner creation fails
 */
const createPlannerAsStandAlone = async (
  data: CreatePlannerAsStandAloneInput
): Promise<Partial<IPlanner>> => {
  const newPlanner = new Planner(data as any);
  const savedPlanner = await newPlanner.save();
  return savedPlanner;
};

/**
 * Service function to request a change for the planner date.
 *
 * This function allows a user to request a change for the planner date. It checks if the user is authorized to make the request, ensures that a request has not already been made for the same planner, updates the planner with the requested date and reason, and creates a notification for the manager about the change request.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner for which the change is being requested.
 * @param {AuthenticatedRequest['user']} user - The authenticated user making the request.
 * @param {RequestChangePlannerDateInput} data - The data containing the requested date and reason for the change.
 * @returns {Promise<Partial<IPlanner | null>>} - The updated planner with the requested change.
 * @throws {Error} - Throws an error if the user is not authorized, if a request has already been made, or if the planner is not found.
 */
const requestChangePlannerDate = async (
  id: IdOrIdsInput['id'],
  user: AuthenticatedRequest['user'],
  data: RequestChangePlannerDateInput
): Promise<Partial<IPlanner | null>> => {
  const isClientExist = await ClientManagement.findOne({
    'clients.clientId': new mongoose.Types.ObjectId(user?._id),
    'clients.status': { $in: [ClientStatus.APPROVED] },
  });

  if (!isClientExist) {
    throw new Error('You are not authorized to request a change for the planner date.');
  }

  // Check if the request already exists
  const existingRequest = await Planner.findOne({
    _id: id,
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(user?._id) },
      { createdBy: new mongoose.Types.ObjectId(user?._id) },
    ],
  });

  if (existingRequest?.requestedDate) {
    throw new Error('You have already requested a change for the planner date.');
  }

  const updatedPlanner = await Planner.findByIdAndUpdate(
    id,
    {
      requestedDate: data.requestedDate,
      requestedReason: data.requestedReason,
      requestStatus: RequestStatus.PENDING,
    },
    { new: true }
  );

  if (!updatedPlanner) {
    throw new Error('Planner not found');
  }

  // Create a notification for the manager about the change request
  await NotificationSchema.create({
    receiver: new mongoose.Types.ObjectId(isClientExist.managerId),
    sender: new mongoose.Types.ObjectId(user?._id),
    type: NotificationType.PLANNER_UPDATE_REQUEST,
    title: 'Planner Date Change Request',
    message: `A change has been requested for the planner date: ${updatedPlanner.plannerDate} to ${updatedPlanner.requestedDate}. Planner type: ${updatedPlanner.plannerType}. Reason: ${data.requestedReason}.`,
    referenceModel: 'Planner',
    referenceId: new mongoose.Types.ObjectId(updatedPlanner._id),
  });

  return updatedPlanner;
};

/**
 * Service function to update a single planner by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update.
 * @param {UpdatePlannerInput} data - The updated data for the planner.
 * @returns {Promise<Partial<IPlanner>>} - The updated planner.
 */

const updatePlanner = async (
  id: IdOrIdsInput['id'],
  data: UpdatePlannerAsManagerInput,
  standAloneId?: string
): Promise<Partial<IPlanner | null>> => {
  const existingPlanner = await Planner.findById(id)
    .select('standAloneId createdBy plannerDate plannerType')
    .lean();

  if (!existingPlanner) {
    throw new Error('Planner not found');
  }

  const accessOwnerId = standAloneId || String(existingPlanner.createdBy);

  // if (!hasOwnerAccess(existingPlanner, accessOwnerId)) {
  //   throw new Error('You are not authorized to update this planner.');
  // }

  const incomingDate = new Date(data.plannerDate); // Convert incoming planner date to Date object
  const oldDate = new Date(existingPlanner.plannerDate); // Convert existing planner date to Date object

  if (isNaN(incomingDate.getTime())) {
    throw new Error('Invalid planner date');
  }

  // Calculate date difference (in milliseconds)
  const dateDifference = incomingDate.getTime() - oldDate.getTime();

  // Update all planner date with the incoming planner date and adjust the further planner dates for the same owner with the same type of existing planner type

  // If the existing planner date is 2023-08-01 and the incoming planner date is 2023-08-05, then all the planner date with the same type of existing planner type will be updated with the difference of 4 days (2023-08-05 - 2023-08-01) from the existing planner date. So, the planner date with the same type of existing planner type will be updated to 2023-08-05, 2023-08-09, 2023-08-13 and so on.

  // Find all planners that need shifting
  const plannersToShift = await Planner.find({
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(accessOwnerId) },
      { createdBy: new mongoose.Types.ObjectId(accessOwnerId) },
    ],
    plannerType: existingPlanner.plannerType,
    plannerDate: { $gte: oldDate },
  }).sort({ plannerDate: 1 });

  if (!plannersToShift.length) {
    throw new Error('No planners found to update');
  }

  // Shift each planner individually
  const bulkOperations = plannersToShift.map((planner) => ({
    updateOne: {
      filter: { _id: planner._id },
      update: {
        $set: {
          plannerDate: new Date(new Date(planner.plannerDate).getTime() + dateDifference),
        },
      },
    },
  }));

  await Planner.bulkWrite(bulkOperations);

  // Return updated main planner
  const updatedPlanner = await Planner.findById(id);

  return updatedPlanner;
};

/**
 * Service function to update a single planner by ID for Standalone User.
 *
 * This function is for standalone users to update their planners. It checks for ownership and then updates the planner date along with shifting other related planners of the same type for the same owner.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update.
 * @param {UpdatePlannerAsManagerInput} data - The updated data for the planner.
 * @param {AuthenticatedRequest['user']} user - The authenticated user making the request.
 * @returns {Promise<Partial<IPlanner | null>>} - The updated planner.
 */
const updatePlannerAsStandAlone = async (
  id: IdOrIdsInput['id'],
  data: UpdatePlannerAsManagerInput,
  user: AuthenticatedRequest['user']
): Promise<Partial<IPlanner | null>> => {
  const existingPlanner = await Planner.findById(id)
    .select('createdBy standAloneId plannerDate plannerType')
    .lean();

  if (!existingPlanner) {
    throw new Error('Planner not found');
  }

  const accessOwnerId = String(existingPlanner.createdBy) || String(existingPlanner.standAloneId);

  if (!hasOwnerAccess(existingPlanner, accessOwnerId)) {
    throw new Error('You are not authorized to update this planner.');
  }

  // Is this user has any transport manager client relationship
  const isClientExist = await ClientManagement.findOne({
    $or: [
      {
        'clients.clientId': new mongoose.Types.ObjectId(user?._id),
        'clients.status': ClientStatus.APPROVED,
      },
      { managerId: new mongoose.Types.ObjectId(user?._id) },
    ],
  });

  console.log('isClientExist', !!isClientExist);

  if (!!isClientExist) {
    throw new Error(
      'You are not authorized to update this planner. Please send a request to your transport manager to update the planner date.'
    );
  }

  const incomingDate = new Date(data.plannerDate); // Convert incoming planner date to Date object
  const oldDate = new Date(existingPlanner.plannerDate); // Convert existing planner date to Date object

  if (isNaN(incomingDate.getTime())) {
    throw new Error('Invalid planner date');
  }

  // Calculate date difference (in milliseconds)
  const dateDifference = incomingDate.getTime() - oldDate.getTime();

  // Update all planner date with the incoming planner date and adjust the further planner dates for the same owner with the same type of existing planner type

  // If the existing planner date is 2023-08-01 and the incoming planner date is 2023-08-05, then all the planner date with the same type of existing planner type will be updated with the difference of 4 days (2023-08-05 - 2023-08-01) from the existing planner date. So, the planner date with the same type of existing planner type will be updated to 2023-08-05, 2023-08-09, 2023-08-13 and so on.

  // Find all planners that need shifting
  const plannersToShift = await Planner.find({
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(accessOwnerId) },
      { createdBy: new mongoose.Types.ObjectId(accessOwnerId) },
    ],
    plannerType: existingPlanner.plannerType,
    plannerDate: { $gte: oldDate },
  }).sort({ plannerDate: 1 });

  if (!plannersToShift.length) {
    throw new Error('No planners found to update');
  }

  // Shift each planner individually
  const bulkOperations = plannersToShift.map((planner) => ({
    updateOne: {
      filter: { _id: planner._id },
      update: {
        $set: {
          plannerDate: new Date(new Date(planner.plannerDate).getTime() + dateDifference),
        },
      },
    },
  }));

  await Planner.bulkWrite(bulkOperations);

  // Return updated main planner
  const updatedPlanner = await Planner.findById(id);

  return updatedPlanner;
};

/**
 * Service function to delete a single planner by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to delete.
 * @returns {Promise<Partial<IPlanner>>} - The deleted planner.
 */
const deletePlanner = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<IPlanner | null>> => {
  const existingDeletedPlanner = await Planner.find({
    _id: id,
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(standAloneId!) },
      { createdBy: new mongoose.Types.ObjectId(userId) },
      { createdBy: new mongoose.Types.ObjectId(standAloneId) },
    ],
  })
    .select('standAloneId createdBy')
    .lean();

  if (!existingDeletedPlanner) {
    throw new Error('Planner not found');
  }

  const deletedPlanner = await Planner.findByIdAndDelete(id);
  return deletedPlanner;
};

/**
 * Service function to retrieve a single planner by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve.
 * @returns {Promise<Partial<IPlanner>>} - The retrieved planner.
 */
const getPlannerById = async (id: IdOrIdsInput['id']): Promise<Partial<IPlanner | null>> => {
  const planner = await Planner.findById(id);
  return planner;
};

/**
 * Service function to retrieve multiple planner based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering planner.
 * @returns {Promise<Partial<IPlanner>[]>} - The retrieved planner
 */
const getManyPlanner = async (
  query: SearchQueryInput & { standAloneId?: string }
): Promise<{ planners: Partial<IPlanner>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId } = query;
  // Build the search filter based on the search key
  const searchFilter = searchKey
    ? {
        $or: [
          { serviceName: { $regex: searchKey, $options: 'i' } },
          { description: { $regex: searchKey, $options: 'i' } },
          { serviceLink: { $regex: searchKey, $options: 'i' } },
        ],
      }
    : {};

  const filter: any = { ...searchFilter };

  if (standAloneId) {
    const ownerFilter = {
      $or: [
        { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(standAloneId) },
      ],
    };

    if (Object.keys(filter).length > 0) {
      Object.assign(filter, { $and: [searchFilter, ownerFilter] });
      delete filter.$or;
    } else {
      Object.assign(filter, ownerFilter);
    }
  }

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching planner
  const totalData = await Planner.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find planners based on the search filter with pagination
  const planners = await Planner.find(searchFilter).skip(skipItems).limit(showPerPage).select(''); // Keep/Exclude any field if needed
  return { planners, totalData, totalPages };
};

/**
 * Service function to retrieve all requested planners for a user.
 *
 * This function retrieves all planners that have a requested date (indicating a change request) and are associated with the user either as a creator or through a standalone ID. It is used to show users the planners for which they have requested changes.
 *
 * @param {AuthenticatedRequest['user']} user - The authenticated user for whom to retrieve the requested planners.
 * @param {string} standAloneId - The standalone ID to filter planners by ownership.
 * @returns {Promise<Partial<IPlanner>[]>} - An array of planners that have requested changes associated with the user.
 */
const getAllRequestedPlanners = async (
  user: AuthenticatedRequest['user'],
  standAloneId: string
): Promise<Partial<IPlanner>[]> => {
  const requestedPlanners = await Planner.find({
    requestedDate: { $ne: null },
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
      { createdBy: new mongoose.Types.ObjectId(standAloneId) },
      { createdBy: new mongoose.Types.ObjectId(user?._id) },
    ],
  });

  return requestedPlanners;
};

const approvalForPlannerChangesRequest = async (
  id: IdOrIdsInput['id'],
  user: AuthenticatedRequest['user']
): Promise<Partial<IPlanner | null>> => {
  const existingPlanner = await Planner.findById(id)
    .select('standAloneId createdBy plannerDate plannerType requestStatus requestedDate')
    .lean();

  if (!existingPlanner) {
    throw new Error('Planner not found');
  }

  const accessOwnerId = String(existingPlanner.createdBy) || String(existingPlanner.standAloneId);

  if (existingPlanner.requestStatus !== RequestStatus.PENDING) {
    throw new Error('This planner date change request has already been processed.');
  }

  const incomingDate = new Date(existingPlanner.requestedDate!); // Convert incoming planner date to Date object
  const oldDate = new Date(existingPlanner.plannerDate); // Convert existing planner date to Date object

  if (isNaN(incomingDate.getTime())) {
    throw new Error('Invalid planner date');
  }

  // Calculate date difference (in milliseconds)
  const dateDifference = incomingDate.getTime() - oldDate.getTime();

  // Update all planner date with the incoming planner date and adjust the further planner dates for the same owner with the same type of existing planner type

  // If the existing planner date is 2023-08-01 and the incoming planner date is 2023-08-05, then all the planner date with the same type of existing planner type will be updated with the difference of 4 days (2023-08-05 - 2023-08-01) from the existing planner date. So, the planner date with the same type of existing planner type will be updated to 2023-08-05, 2023-08-09, 2023-08-13 and so on.

  // Find all planners that need shifting
  const plannersToShift = await Planner.find({
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(accessOwnerId) },
      { createdBy: new mongoose.Types.ObjectId(accessOwnerId) },
    ],
    plannerType: existingPlanner.plannerType,
    plannerDate: { $gte: oldDate },
  }).sort({ plannerDate: 1 });

  if (!plannersToShift.length) {
    throw new Error('No planners found to update');
  }

  // Shift each planner individually
  const bulkOperations = plannersToShift.map((planner) => ({
    updateOne: {
      filter: { _id: planner._id },
      update: {
        $set: {
          plannerDate: new Date(new Date(planner.plannerDate).getTime() + dateDifference),
        },
      },
    },
  }));

  await Planner.bulkWrite(bulkOperations);

  console.log(bulkOperations);

  // Update the main planner's plannerDate and requestStatus
  const updatedPlanner = await Planner.findByIdAndUpdate(
    id,
    {
      $set: {
        plannerDate: existingPlanner.requestedDate,
        requestStatus: RequestStatus.APPROVED,
      },
    },
    { new: true }
  );

  if (!updatedPlanner) {
    throw new Error('Failed to update planner');
  }

  // Create a notification for the user about the approval/rejection of the change request
  await NotificationSchema.create({
    receiver: new mongoose.Types.ObjectId(existingPlanner.createdBy),
    sender: new mongoose.Types.ObjectId(user?._id),
    type: NotificationType.PLANNER_UPDATE_APPROVAL,
    title: 'Planner Date Change Approved',
    message: `Your change request for the planner date has been approved. The new planner date is ${updatedPlanner.plannerDate}.`,
    referenceModel: 'Planner',
    referenceId: new mongoose.Types.ObjectId(updatedPlanner._id),
  });

  return updatedPlanner;
};

/**
 * Service function to reject a planner date change request.
 *
 * This function is used to reject a pending planner date change request. It updates the request status to "REJECTED" and sends a notification to the user who made the request about the rejection.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the planner for which the change request is being rejected.
 * @param {AuthenticatedRequest['user']} user - The authenticated user who is rejecting the change request.
 * @returns {Promise<Partial<IPlanner | null>>} - The updated planner with the rejected status.
 * @throws {Error} - Throws an error if the planner is not found or if the request has already been processed.
 */
const rejectPlannerChangeRequest = async (
  id: IdOrIdsInput['id'],
  user: AuthenticatedRequest['user']
): Promise<Partial<IPlanner | null>> => {
  const existingPlanner = await Planner.findById(id)
    .select('standAloneId createdBy plannerDate plannerType requestStatus requestedDate')
    .lean();

  if (!existingPlanner) {
    throw new Error('Planner not found');
  }

  if (existingPlanner.requestStatus !== RequestStatus.PENDING) {
    throw new Error('This planner date change request has already been processed.');
  }

  existingPlanner.requestStatus = RequestStatus.REJECTED;

  const updatedPlanner = await Planner.findByIdAndUpdate(id, existingPlanner, { new: true });

  if (!updatedPlanner) {
    throw new Error('Failed to update planner');
  }

  // Create a notification for the user about the approval/rejection of the change request
  await NotificationSchema.create({
    receiver: new mongoose.Types.ObjectId(existingPlanner.createdBy),
    sender: new mongoose.Types.ObjectId(user?._id),
    type: NotificationType.PLANNER_UPDATE_REJECTION,
    title: 'Planner Date Change Rejected',
    message: `Your change request for the planner date has been rejected. The planner date remains as ${updatedPlanner.plannerDate}.`,
    referenceModel: 'Planner',
    referenceId: new mongoose.Types.ObjectId(updatedPlanner._id),
  });

  return updatedPlanner;
};

/**
 * Service function to create multiple planners with specific dates as Transport Manager
 *
 * @param {CreatePlannerAsManagerInput & { dates }} data - The data to create multiple planners
 * @returns {Promise<Partial<IPlanner>[]>} - The created planners
 * @throws {Error} - Throws an error if the planner creation fails
 */
const bulkCreatePlannerAsManager = async (data: any): Promise<Partial<IPlanner>[]> => {
  const { vehicleId, plannerType, dates, createdBy, standAloneId } = data;

  if (!dates || dates.length === 0) {
    throw new Error('At least one date is required');
  }

  const createdPlanners: Partial<IPlanner>[] = [];

  for (const dateString of dates) {
    const dateObj = new Date(dateString);
    if (Number.isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }

    const checkDuplicate = await Planner.findOne({
      plannerType,
      plannerDate: {
        $gte: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
        $lt: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1),
      },
      $or: [
        { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(createdBy) },
      ],
    }).lean();

    if (!checkDuplicate) {
      const newPlanner = new Planner({
        vehicleId,
        plannerType,
        plannerDate: new Date(dateObj),
        createdBy: new mongoose.Types.ObjectId(createdBy),
        standAloneId: new mongoose.Types.ObjectId(standAloneId),
      });
      const savedPlanner = await newPlanner.save();
      createdPlanners.push(savedPlanner);
    }
  }

  if (createdPlanners.length === 0) {
    throw new Error('No new planners were created. All dates may already have existing planners.');
  }

  return createdPlanners;
};

/**
 * Service function to create multiple planners with specific dates as Standalone User
 *
 * @param {CreatePlannerAsStandAloneInput & { dates }} data - The data to create multiple planners
 * @returns {Promise<Partial<IPlanner>[]>} - The created planners
 * @throws {Error} - Throws an error if the planner creation fails
 */
const bulkCreatePlannerAsStandAlone = async (data: any): Promise<Partial<IPlanner>[]> => {
  const { vehicleId, plannerType, dates, createdBy } = data;

  if (!dates || dates.length === 0) {
    throw new Error('At least one date is required');
  }

  const createdPlanners: Partial<IPlanner>[] = [];

  for (const dateString of dates) {
    const dateObj = new Date(dateString);
    if (Number.isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }

    const checkDuplicate = await Planner.findOne({
      plannerType,
      plannerDate: {
        $gte: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()),
        $lt: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1),
      },
      createdBy: new mongoose.Types.ObjectId(createdBy),
    }).lean();

    if (!checkDuplicate) {
      const newPlanner = new Planner({
        vehicleId,
        plannerType,
        plannerDate: new Date(dateObj),
        createdBy: new mongoose.Types.ObjectId(createdBy),
      });
      const savedPlanner = await newPlanner.save();
      createdPlanners.push(savedPlanner);
    }
  }

  if (createdPlanners.length === 0) {
    throw new Error('No new planners were created. All dates may already have existing planners.');
  }

  return createdPlanners;
};

/**
 * Service function to update the status of planners to "DUE" if their plannerDate is less than the current date and their status is not already "DUE".
 *
 * This function is intended to be run as a scheduled job (e.g., using a cron job) to automatically update the status of planners that are past their due date.
 * It checks all planners in the database and updates the status to "DUE" for those that meet the criteria.
 */
const plannerStatusUpdateToDue = async (): Promise<number> => {
  // current date
  const currentDate = new Date();

  // Update all planners whose plannerDate is less than current date and status is not "DUE" to "DUE"
  const result = await Planner.updateMany(
    { plannerDate: { $lt: currentDate }, status: { $ne: PlannerStatus.DUE } },
    { $set: { status: PlannerStatus.DUE } }
  );

  return result.modifiedCount;
};

export const plannerServices = {
  createPlannerAsManager,
  createPlannerAsStandAlone,
  bulkCreatePlannerAsManager,
  bulkCreatePlannerAsStandAlone,
  requestChangePlannerDate,
  updatePlanner,
  updatePlannerAsStandAlone,
  deletePlanner,
  getPlannerById,
  getManyPlanner,
  getAllRequestedPlanners,
  approvalForPlannerChangesRequest,
  rejectPlannerChangeRequest,
  plannerStatusUpdateToDue,
};
