// Import the model
import mongoose from 'mongoose';

import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import UserSubscription, {
  IUserSubscription,
  SubscriptionStatus,
} from '../../models/subscription-billing/userSubscription.schema';
import {
  CreateManySubscriptionTrialInput,
  CreateSubscriptionTrialInput,
  UpdateManySubscriptionTrialInput,
  UpdateSubscriptionTrialInput,
} from './subscription-trial.validation';

/**
 * Service function to create a new subscription-trial.
 *
 * @param {CreateSubscriptionTrialInput} data - The data to create a new subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>>} - The created subscription-trial.
 */
const createSubscriptionTrial = async (
  data: Partial<IUserSubscription> & { userId: string }
): Promise<Partial<IUserSubscription>> => {
  const newDate = new Date();
  const endDate = new Date(newDate);
  endDate.setDate(endDate.getDate() + 7); // Set end date to 7 days from now
  data = {
    ...data,
    startDate: newDate,
    endDate: endDate,
    status: 'TRIAL',
  };
  const existingSubscriptionTrial = await UserSubscription.findOne({
    userId: data.userId,
  }).lean();
  if (existingSubscriptionTrial) {
    throw new Error(
      'Duplicate detected: An active subscription-trial for this user and subscription already exists.'
    );
  }

  const newSubscriptionTrial = new UserSubscription(data);
  const savedSubscriptionTrial = await newSubscriptionTrial.save();
  return savedSubscriptionTrial;
};

/**
 * Service function to create multiple subscription-trial.
 *
 * @param {CreateManySubscriptionTrialInput} data - An array of data to create multiple subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>[]>} - The created subscription-trial.
 */
const createManySubscriptionTrial = async (
  data: CreateManySubscriptionTrialInput
): Promise<Partial<IUserSubscription>[]> => {
  const createdSubscriptionTrial = await UserSubscription.insertMany(data);
  return createdSubscriptionTrial;
};

/**
 * Service function to update a single subscription-trial by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to update.
 * @param {UpdateSubscriptionTrialInput} data - The updated data for the subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>>} - The updated subscription-trial.
 */
const updateSubscriptionTrial = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionTrialInput
): Promise<Partial<IUserSubscription | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionTrial = await UserSubscription.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionTrial) {
    throw new Error(
      'Duplicate detected: Another subscription-trial with the same fieldName already exists.'
    );
  }
  // Proceed to update the subscription-trial
  const updatedSubscriptionTrial = await UserSubscription.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionTrial;
};

/**
 * Service function to update multiple subscription-trial.
 *
 * @param {UpdateManySubscriptionTrialInput} data - An array of data to update multiple subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>[]>} - The updated subscription-trial.
 */
const updateManySubscriptionTrial = async (
  data: UpdateManySubscriptionTrialInput
): Promise<Partial<IUserSubscription>[]> => {
  // Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingSubscriptionTrial = await UserSubscription.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingSubscriptionTrial.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subscription-trial with the same fieldName already exist.'
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
  const bulkResult = await UserSubscription.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await UserSubscription.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<IUserSubscription>[];
};

/**
 * Service function to delete a single subscription-trial by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to delete.
 * @returns {Promise<Partial<IUserSubscription>>} - The deleted subscription-trial.
 */
const deleteSubscriptionTrial = async (
  id: IdOrIdsInput['id']
): Promise<Partial<IUserSubscription | null>> => {
  const deletedSubscriptionTrial = await UserSubscription.findByIdAndDelete(id);
  return deletedSubscriptionTrial;
};

/**
 * Service function to delete multiple subscription-trial.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-trial to delete.
 * @returns {Promise<Partial<IUserSubscription>[]>} - The deleted subscription-trial.
 */
const deleteManySubscriptionTrial = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<IUserSubscription>[]> => {
  const subscriptionTrialToDelete = await UserSubscription.find({ _id: { $in: ids } });
  if (!subscriptionTrialToDelete.length) throw new Error('No subscription-trial found to delete');
  await UserSubscription.deleteMany({ _id: { $in: ids } });
  return subscriptionTrialToDelete;
};

/**
 * Service function to retrieve a single subscription-trial by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-trial to retrieve.
 * @returns {Promise<Partial<IUserSubscription | null>>} - The retrieved subscription-trial.
 */
const getSubscriptionTrialById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<IUserSubscription | null>> => {
  const subscriptionTrial = await UserSubscription.findById(id);
  return subscriptionTrial;
};

/**
 * Service function to retrieve multiple subscription-trial based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-trial.
 * @returns {Promise<Partial<IUserSubscription>[]>} - The retrieved subscription-trial
 */
const getManySubscriptionTrial = async (
  query: SearchQueryInput
): Promise<{
  subscriptionTrials: Partial<IUserSubscription>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      // { fieldName: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription-trial
  const totalData = await UserSubscription.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription-trials based on the search filter with pagination
  const subscriptionTrials = await UserSubscription.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionTrials, totalData, totalPages };
};

/**
 * Get remaining trial days for a user.
 * @param userId string - Mongo user id
 * @returns { daysRemaining: number, expired: boolean, startDate?: Date, endDate?: Date }
 */
export const getTrialRemainingDays = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error('Invalid user id');
  const subscription = await UserSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    status: SubscriptionStatus.TRIAL,
  }).lean();
  if (!subscription || !subscription.endDate) {
    return { daysRemaining: 0, expired: true };
  }
  const now = new Date();
  const diffMs = subscription.endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const expired = diffMs <= 0;
  return {
    daysRemaining: expired ? 0 : daysRemaining,
    expired,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    subscriptionId: subscription._id?.toString?.(),
  };
};

export const subscriptionTrialServices = {
  createSubscriptionTrial,
  createManySubscriptionTrial,
  updateSubscriptionTrial,
  updateManySubscriptionTrial,
  deleteSubscriptionTrial,
  deleteManySubscriptionTrial,
  getSubscriptionTrialById,
  getManySubscriptionTrial,
  getTrialRemainingDays,
};

