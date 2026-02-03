import mongoose from 'mongoose';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import SubscriptionDuration, {
  ISubscriptionDuration,
} from '../../models/subscription-billing/subscriptionDuration.schema';
import {
  CreateSubscriptionDurationInput,
  UpdateSubscriptionDurationInput,
} from './subscription-duration.validation';

/**
 * Service function to create a new subscriptionDuration.
 *
 * @param {CreateSubscriptionDurationInput} data - The data to create a new subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The created subscriptionDuration.
 */
const createSubscriptionDuration = async (
  data: CreateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration>> => {
  // Check if a subscription duration with the same name and duration already exists
  const existingDuration = await SubscriptionDuration.findOne({
    $or: [
      {
        name: new RegExp(`^${data.name}$`, 'i'), // case insensitive
      },
      { durationInDays: data.durationInDays },
    ],
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
 * Service function to create multiple subscriptionDuration.
 *
 * @param {CreateSubscriptionDurationInput[]} data - An array of data to create multiple subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The created subscriptionDuration.
 */
const createManySubscriptionDuration = async (
  data: CreateSubscriptionDurationInput[]
): Promise<Partial<ISubscriptionDuration>[]> => {
  // Check for existing subscription durations with the same name or durationInDays
  const existingDurations = await SubscriptionDuration.find({
    $or: data.map((item) => ({
      $or: [
        { name: new RegExp(`^${item.name}$`, 'i') }, // case insensitive
        { durationInDays: item.durationInDays },
      ],
    })),
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
 * Service function to update a single subscriptionDuration by ID.
 *
 * @param {string} id - The ID of the subscriptionDuration to update.
 * @param {UpdateSubscriptionDurationInput} data - The updated data for the subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The updated subscriptionDuration.
 */
const updateSubscriptionDuration = async (
  id: string,
  data: UpdateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! Update Guard: Restrict modification of subscription duration when it is in active use.

  // TODO: Check whether this duration is referenced by any subscription.
  // TODO: If referenced, verify whether any users have purchased that subscription.
  // TODO: If users exist, prevent updating core duration fields (e.g., name, durationInDays).
  // TODO: Allow updating only the status field (isActive) regardless of usage.

  // Check for duplicate name and durationInDays combination
  const existingDuration = await SubscriptionDuration.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      { name: new RegExp(`^${data.name}$`, 'i') }, // case insensitive
      { durationInDays: data.durationInDays },
    ],
  });
  // Prevent duplicate subscription durations
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
 * Service function to update multiple subscriptionDuration.
 *
 * @param {Array<{ id: string, updates: UpdateSubscriptionDurationInput }>} data - An array of data to update multiple subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The updated subscriptionDuration.
 */
export const updateManySubscriptionDuration = async (
  data: Array<{ id: string; updates: UpdateSubscriptionDurationInput }>
): Promise<Partial<ISubscriptionDuration>[]> => {
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
      { name: new RegExp(`^${item.updates.name}$`, 'i') }, // case insensitive
      { durationInDays: item.updates.durationInDays },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingDurations.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subscription durations with the same name (case-insensitive) or durationInDays already exist.'
    );
  }
  // Prepare bulk operations
  const operations = data.map((item) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(item.id) },
      update: { $set: item.updates },
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
 * Service function to delete a single subscriptionDuration by ID.
 *
 * @param {string} id - The ID of the subscriptionDuration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The deleted subscriptionDuration.
 */
const deleteSubscriptionDuration = async (
  id: string
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! If this duration is implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if this duration exists in any subscription
  // TODO: * Second, check if any user has taken this subscription
  // TODO: * If taken by any user, throw a thorough error: 'This duration is already assigned to a user's subscription'

  // Proceed to delete the subscription duration
  const deletedSubscriptionDuration = await SubscriptionDuration.findByIdAndDelete(id);
  return deletedSubscriptionDuration;
};

/**
 * Service function to delete multiple subscriptionDuration.
 *
 * @param {string[]} ids - An array of IDs of subscriptionDuration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The deleted subscriptionDuration.
 */
const deleteManySubscriptionDuration = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionDuration>[]> => {
  // ! If these durations are implemented in any subscription and that subscription is used by any user, do not allow deletion

  // Proceed to delete the subscription durations
  const subscriptionDurationToDelete = await SubscriptionDuration.find({ _id: { $in: ids } });
  if (!subscriptionDurationToDelete.length)
    throw new Error('No subscriptionDuration found to delete');
  // Delete the subscription durations
  await SubscriptionDuration.deleteMany({ _id: { $in: ids } });
  return subscriptionDurationToDelete;
};

/**
 * Service function to retrieve a single subscriptionDuration by ID.
 *
 * @param {string} id - The ID of the subscriptionDuration to retrieve.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The retrieved subscriptionDuration.
 */
const getSubscriptionDurationById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionDuration | null>> => {
  // Find the subscription duration by ID
  const subscriptionDuration = await SubscriptionDuration.findById(id);
  return subscriptionDuration;
};

/**
 * Service function to retrieve multiple subscriptionDuration based on query parameters.
 *
 * @param {object} query - The query parameters for filtering subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The retrieved subscriptionDuration
 */
const getManySubscriptionDuration = async (query: {
  searchKey?: string;
  showPerPage: number;
  pageNo: number;
}): Promise<{
  subscriptionDurations: Partial<ISubscriptionDuration>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage, pageNo } = query;

  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { durationInDays: Number(searchKey) || -1 }, // convert searchKey to number
      // If searchKey is not a number, -1 will ensure no match
    ],
  };

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;

  // Find the total count of matching subscriptionDuration
  const totalData = await SubscriptionDuration.countDocuments(searchFilter);

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);

  // Find subscriptionDuration based on the search filter with pagination
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
