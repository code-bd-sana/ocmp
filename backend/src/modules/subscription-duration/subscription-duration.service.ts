import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import SubscriptionDuration, {
  ISubscriptionDuration,
} from '../../models/subscription-billing/subscriptionDuration.schema';
import {
  CreateManySubscriptionDurationInput,
  CreateSubscriptionDurationInput,
  UpdateManySubscriptionDurationInput,
  UpdateSubscriptionDurationInput,
} from './subscription-duration.validation';

/**
 * Service function to create a new subscription duration.
 *
 * @param {CreateSubscriptionDurationInput} data - The data to create a new subscription duration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The created subscription duration.
 */
const createSubscriptionDuration = async (
  data: CreateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration>> => {
  // Check if a subscription duration with the same name and duration already exists
  const existingDuration = await SubscriptionDuration.findOne({
    $or: [{ name: data.name.toUpperCase() }, { durationInDays: data.durationInDays }],
  });
  // Prevent duplicate subscription durations
  if (existingDuration) {
    throw new Error('A subscription duration with the same name and duration already exists.');
  }
  // Create and save the new subscription duration
  const newSubscriptionDuration = new SubscriptionDuration(data);
  const savedSubscriptionDuration = await newSubscriptionDuration.save();
  return savedSubscriptionDuration;
};

/**
 * Service function to create multiple subscription durations.
 *
 * @param {CreateManySubscriptionDurationInput} data - An array of data to create multiple subscription durations.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The created subscription durations.
 */
const createManySubscriptionDuration = async (
  data: CreateManySubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration>[]> => {
  // Check for existing subscription durations with the same name or durationInDays
  const existingDurations = await SubscriptionDuration.find({
    $or: data.flatMap((item) => [
      { name: item.name.toUpperCase() },
      { durationInDays: item.durationInDays },
    ]),
  });
  // Prevent duplicate subscription durations
  if (existingDurations.length > 0) {
    throw new Error(
      'One or more subscription durations with the same name or duration already exist.'
    );
  }
  // Create and save the new subscription durations
  const createdSubscriptionDuration = await SubscriptionDuration.insertMany(data);
  return createdSubscriptionDuration;
};

/**
 * Service function to update a single subscription duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription duration to update.
 * @param {UpdateSubscriptionDurationInput} data - The updated data for the subscription duration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The updated subscription duration.
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
    throw new Error('A subscription duration with the same name or duration already exists.');
  }
  // Proceed to update the subscription duration
  const updatedSubscriptionDuration = await SubscriptionDuration.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionDuration;
};

/**
 * Service function to update multiple subscription durations.
 *
 * @param {UpdateManySubscriptionDurationInput} data - An array of data to update multiple subscription durations.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The updated subscription durations.
 */
const updateManySubscriptionDuration = async (
  data: UpdateManySubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration>[]> => {
  // ! Update Guard: Restrict modification of subscription durations when they are in active use.

  // TODO: Check whether these durations are referenced by any subscription.
  // TODO: If referenced, verify whether any users have purchased those subscriptions.
  // TODO: If users exist, prevent updating core duration fields (e.g., name, durationInDays).
  // TODO: Allow updating only the status field (isActive) regardless of usage.

  // Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (name or durationInDays) excluding the documents being updated
  const existingDurations = await SubscriptionDuration.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      { name: item.name?.toUpperCase() },
      { durationInDays: item.durationInDays },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingDurations.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subscription durations with the same name or durationInDays already exist.'
    );
  }
  // Prepare bulk operations
  const operations = data.map((item) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(item.id) },
      update: { $set: item },
      upsert: false,
    },
  }));
  // Execute bulk update
  const bulkResult = await SubscriptionDuration.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await SubscriptionDuration.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ISubscriptionDuration>[];
};

/**
 * Service function to delete a single subscription duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription duration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The deleted subscription duration.
 */
const deleteSubscriptionDuration = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! If this duration is implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if this duration exists in any subscription
  // TODO: * Second, check if any user has taken this subscription
  // TODO: * If taken by any user, throw a thorough error: 'This duration is already assigned to a user's subscription'

  const deletedSubscriptionDuration = await SubscriptionDuration.findByIdAndDelete(id);
  return deletedSubscriptionDuration;
};

/**
 * Service function to delete multiple subscription durations.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription durations to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The deleted subscription durations.
 */
const deleteManySubscriptionDuration = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionDuration>[]> => {
  // ! If these durations are implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if these durations exist in any subscription
  // TODO: * Second, check if any user has taken these subscriptions
  // TODO: * If taken by any user, throw a thorough error: 'One or more durations are already assigned to a user's subscription'

  // Proceed to delete the subscription durations
  const subscriptionDurationToDelete = await SubscriptionDuration.find({ _id: { $in: ids } });
  if (!subscriptionDurationToDelete.length)
    throw new Error('No subscriptionDuration found to delete');
  // Delete the subscription durations
  await SubscriptionDuration.deleteMany({ _id: { $in: ids } });
  return subscriptionDurationToDelete;
};

/**
 * Service function to retrieve a single subscription duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription duration to retrieve.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The retrieved subscription duration.
 */
const getSubscriptionDurationById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionDuration | null>> => {
  const subscriptionDuration = await SubscriptionDuration.findById(id);
  return subscriptionDuration;
};

/**
 * Service function to retrieve multiple subscription durations based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription duration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The retrieved subscription duration.
 */
const getManySubscriptionDuration = async (
  query: SearchQueryInput
): Promise<{
  subscriptionDurations: Partial<ISubscriptionDuration>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { durationInDays: Number(searchKey) || -1 }, // convert searchKey to number
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription durations
  const totalData = await SubscriptionDuration.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription durations based on the search filter with pagination
  const subscriptionDurations = await SubscriptionDuration.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionDurations, totalData, totalPages };
};

export const subscriptionDurationServices = {
  createSubscriptionDuration,
  createManySubscriptionDuration,
  updateSubscriptionDuration,
  updateManySubscriptionDuration,
  deleteSubscriptionDuration,
  deleteManySubscriptionDuration,
  getSubscriptionDurationById,
  getManySubscriptionDuration,
};
