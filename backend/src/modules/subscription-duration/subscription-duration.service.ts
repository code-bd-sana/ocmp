import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { ISubscriptionDuration, SubscriptionDuration, UserRole } from '../../models';
import {
  CreateSubscriptionDurationInput,
  UpdateSubscriptionDurationInput,
} from './subscription-duration.validation';

/**
 * Service function to create a new subscription-duration.
 *
 * @param {CreateSubscriptionDurationInput} data - The data to create a new subscription-duration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The created subscription-duration.
 */
const createSubscriptionDuration = async (
  data: CreateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration>> => {
  // Check if a subscription-duration with the same name and duration already exists
  const existingDuration = await SubscriptionDuration.findOne({
    $or: [{ name: data.name.toUpperCase() }, { durationInDays: data.durationInDays }],
  });
  // Prevent duplicate subscription-durations
  if (existingDuration) {
    throw new Error('A subscription-duration with the same name and duration already exists.');
  }
  // Create and save the new subscription-duration
  const newSubscriptionDuration = new SubscriptionDuration(data);
  const savedSubscriptionDuration = await newSubscriptionDuration.save();
  return savedSubscriptionDuration;
};

/**
 * Service function to update a single subscription-duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-duration to update.
 * @param {UpdateSubscriptionDurationInput} data - The updated data for the subscription-duration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The updated subscription-duration.
 */
const updateSubscriptionDuration = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! Update Guard: Restrict modification of subscription-duration when it is in active use.

  // TODO: Check whether this duration is referenced by any subscription.
  // TODO: If referenced, verify whether any users have purchased that subscription.
  // TODO: If users exist, prevent updating core duration fields (e.g., name, durationInDays).
  // TODO: Allow updating only the status field (isActive) regardless of usage.

  // Check for duplicate name and durationInDays combination
  const existingDuration = await SubscriptionDuration.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [{ name: data.name?.toUpperCase() }, { durationInDays: data.durationInDays }],
  });
  // Prevent duplicate updates
  if (existingDuration) {
    throw new Error('A subscription-duration with the same name or duration already exists.');
  }
  // Proceed to update the subscription-duration
  const updatedSubscriptionDuration = await SubscriptionDuration.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionDuration;
};

/**
 * Service function to delete a single subscription-duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-duration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The deleted subscription-duration.
 */
const deleteSubscriptionDuration = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! If this duration is implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if this duration exists in any subscription
  // TODO: * Second, check if any user has taken this subscription
  // TODO: * If taken by any user, throw a thorough error: 'This duration is already assigned to a user's subscription'

  // Proceed to delete the subscription-duration
  const deletedSubscriptionDuration = await SubscriptionDuration.findByIdAndDelete(id);
  return deletedSubscriptionDuration;
};

/**
 * Service function to delete multiple subscription-durations.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-durations to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The deleted subscription-durations.
 */
const deleteManySubscriptionDuration = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionDuration>[]> => {
  // ! If these durations are implemented in any subscription and that subscription is used by any user, do not allow deletion

  // Proceed to delete the subscription-durations
  const subscriptionDurationToDelete = await SubscriptionDuration.find({ _id: { $in: ids } });
  if (!subscriptionDurationToDelete.length)
    throw new Error('No subscription-duration found to delete');
  // Delete the subscription-durations
  await SubscriptionDuration.deleteMany({ _id: { $in: ids } });
  return subscriptionDurationToDelete;
};

/**
 * Service function to retrieve a single subscription-duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-duration to retrieve.
 * @param {UserRole} userRole - The role of the user making the request (to determine access level).
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The retrieved subscription-duration.
 */
const getSubscriptionDurationById = async (
  id: IdOrIdsInput['id'],
  userRole: UserRole
): Promise<Partial<ISubscriptionDuration | null>> => {
  // Determine if user is super admin (has access to all pricing)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build query - filter by isActive if not super admin
  const query: any = { _id: new mongoose.Types.ObjectId(id) };
  if (!isSuperAdmin) {
    query.isActive = true;
  }
  // Find the subscription-duration by ID
  const subscriptionDuration = await SubscriptionDuration.findOne(query);
  return subscriptionDuration;
};

/**
 * Service function to retrieve multiple subscription-durations based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-duration.
 * @param {UserRole} userRole - The role of the user making the request (to determine access level).
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The retrieved subscription-duration.
 */
const getManySubscriptionDuration = async (
  query: SearchQueryInput,
  userRole: UserRole
): Promise<{
  subscriptionDurations: Partial<ISubscriptionDuration>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { durationInDays: Number(searchKey) || -1 }, // convert searchKey to number
    ],
  };
  // If user is not super admin, add filter to show only active subscription-durations
  if (!isSuperAdmin) {
    Object.assign(searchFilter, { isActive: true });
  }
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription-durations
  const totalData = await SubscriptionDuration.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription-durations based on the search filter with pagination
  const subscriptionDurations = await SubscriptionDuration.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionDurations, totalData, totalPages };
};

export const subscriptionDurationServices = {
  createSubscriptionDuration,
  updateSubscriptionDuration,
  deleteSubscriptionDuration,
  deleteManySubscriptionDuration,
  getSubscriptionDurationById,
  getManySubscriptionDuration,
};
