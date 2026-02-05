// Import the model
import mongoose from 'mongoose';

import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import SubscriptionPlan, {
  ISubscriptionPlan,
} from '../../models/subscription-billing/subscriptionPlan.schema';
import {
  CreateSubscriptionPlanInput,
  UpdateManySubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from './subscription-plan.validation';

/**
 * Service function to create a new subscription-plan.
 *
 * @param {CreateSubscriptionPlanInput} data - The data to create a new subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The created subscription-plan.
 */
const createSubscriptionPlan = async (
  data: CreateSubscriptionPlanInput
): Promise<Partial<ISubscriptionPlan>> => {
  // Check if a subscription-plan with the same name and duration already exists
  const existingPlan = await SubscriptionPlan.findOne({
    name: data.name.toUpperCase(),
  });
  // Prevent duplicate subscription-plan
  if (existingPlan) {
    throw new Error('Duplicate detected: A subscription-plan with the same name already exists.');
  }
  const newSubscriptionPlan = new SubscriptionPlan(data);
  const savedSubscriptionPlan = await newSubscriptionPlan.save();
  return savedSubscriptionPlan;
};

/**
 * Service function to update a single subscription-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to update.
 * @param {UpdateSubscriptionPlanInput} data - The updated data for the subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The updated subscription-plan.
 */
const updateSubscriptionPlan = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionPlanInput
): Promise<Partial<ISubscriptionPlan | null>> => {
  // ! Update Guard: Restrict modification of subscription-plan when it is in active use.

  // TODO: Check whether this plan is referenced by any subscription.
  // TODO: If referenced, verify whether any users have purchased that subscription.
  // TODO: If users exist, prevent updating core plan fields (e.g., name, planType and applicableAccountType).
  // TODO: Allow updating only the status(isActive) and description(description) field regardless of usage.

  // Check for duplicate name combination
  const existingSubscriptionPlan = await SubscriptionPlan.findOne({
    _id: { $ne: id }, // Exclude the current document
    name: data.name ? data.name.toUpperCase() : undefined,
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionPlan) {
    throw new Error(
      'Duplicate detected: Another subscription-plan with the same name already exists.'
    );
  }
  // Proceed to update the subscriptionPlan
  const updatedSubscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
  return updatedSubscriptionPlan;
};

/**
 * Service function to update multiple subscription-plan.
 *
 * @param {UpdateManySubscriptionPlanInput} data - An array of data to update multiple subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The updated subscription-plan.
 */
const updateManySubscriptionPlan = async (
  data: UpdateManySubscriptionPlanInput
): Promise<Partial<ISubscriptionPlan>[]> => {
  // ! Update Guard: Restrict modification of subscription-plans when they are in active use.

  // TODO: Check whether these plans are referenced by any subscription.
  // TODO: If referenced, verify whether any users have purchased those subscriptions.
  // TODO: If users exist, prevent updating core plan fields (e.g., name, planType and applicableAccountType).
  // TODO: Allow updating only the status(isActive) and description(description) field regardless of usage.

  // Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (name) excluding the documents being updated
  const existingSubscriptionPlan = await SubscriptionPlan.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    name: {
      $in: data
        .filter((item) => item.name) // only items with name to update
        .map((item) => item.name!.toUpperCase()), // get the names in uppercase
    },
  }).lean();
  // If any duplicates found, throw error
  if (existingSubscriptionPlan.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subscription-plan with the same name already exist.'
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
  const bulkResult = await SubscriptionPlan.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await SubscriptionPlan.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ISubscriptionPlan>[];
};

/**
 * Service function to delete a single subscription-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The deleted subscription-plan.
 */
const deleteSubscriptionPlan = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPlan | null>> => {
  // ! If this plan is implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if this plan exists in any subscription
  // TODO: * Second, check if any user has taken this subscription
  // TODO: * If taken by any user, throw a thorough error: 'This plan is already assigned to a user's subscription'

  const deletedSubscriptionPlan = await SubscriptionPlan.findByIdAndDelete(id);
  return deletedSubscriptionPlan;
};

/**
 * Service function to delete multiple subscription-plan.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-plan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The deleted subscription-plan.
 */
const deleteManySubscriptionPlan = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionPlan>[]> => {
  // ! If these plans are implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if these plans exist in any subscription
  // TODO: * Second, check if any user has taken these subscriptions
  // TODO: * If taken by any user, throw a thorough error: 'One or more plans are already assigned to a user's subscription'

  const subscriptionPlanToDelete = await SubscriptionPlan.find({ _id: { $in: ids } });
  if (!subscriptionPlanToDelete.length) throw new Error('No subscription-plan found to delete');
  await SubscriptionPlan.deleteMany({ _id: { $in: ids } });
  return subscriptionPlanToDelete;
};

/**
 * Service function to retrieve a single subscription-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to retrieve.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The retrieved subscription-plan.
 */
const getSubscriptionPlanById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPlan | null>> => {
  const subscriptionPlan = await SubscriptionPlan.findById(id);
  return subscriptionPlan;
};

/**
 * Service function to retrieve multiple subscription-plan based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The retrieved subscription-plan
 */
const getManySubscriptionPlan = async (
  query: SearchQueryInput
): Promise<{
  subscriptionPlans: Partial<ISubscriptionPlan>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { planType: { $regex: searchKey, $options: 'i' } }, // string search
      { applicableAccountType: { $regex: searchKey, $options: 'i' } }, // string search
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription-plan
  const totalData = await SubscriptionPlan.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription-plan based on the search filter with pagination
  const subscriptionPlans = await SubscriptionPlan.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionPlans, totalData, totalPages };
};

export const subscriptionPlanServices = {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  updateManySubscriptionPlan,
  deleteSubscriptionPlan,
  deleteManySubscriptionPlan,
  getSubscriptionPlanById,
  getManySubscriptionPlan,
};
