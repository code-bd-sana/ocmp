// Import the model

import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import SubscriptionDuration from '../../models/subscription-billing/subscriptionDuration.schema';
import SubscriptionPlan from '../../models/subscription-billing/subscriptionPlan.schema';
import SubscriptionPricing, {
  ISubscriptionPricing,
} from '../../models/subscription-billing/subscriptionPricing.schema';
import {
  CreateSubscriptionPricingInput,
  UpdateSubscriptionPricingInput,
} from './subscription-pricing.validation';

/**
 * Service function to create a new subscriptionPricing.
 *
 * @param {CreateSubscriptionPricingInput} data - The data to create a new subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscriptionPricing.
 */
const createSubscriptionPricing = async (
  data: CreateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing>> => {
  // Extract subscription plan and duration IDs from validated data
  const { subscriptionPlanId, subscriptionDurationId } = data;

  // Check if the subscription plan exists
  const isSubscriptionPlanAvailable = await SubscriptionPlan.findOne({
    _id: subscriptionPlanId,
  });

  // Check if the subscription duration exists
  const isSubscriptionDurationAvailable = await SubscriptionDuration.findOne({
    _id: subscriptionDurationId,
  });

  // Throw error if subscription plan is not found
  if (!isSubscriptionPlanAvailable) {
    throw new Error('Subscription plan not found');
  }

  // Throw error if subscription duration is not found
  if (!isSubscriptionDurationAvailable) {
    throw new Error('Subscription duration not found');
  }
  // Check if a pricing entry already exists for the given subscription plan and duration
  const isExistingPricing = await SubscriptionPricing.findOne({
    subscriptionPlanId,
    subscriptionDurationId,
  });

  if (isExistingPricing) {
    throw new Error('Subscription pricing already exists for the selected plan and duration');
  }

  const newSubscriptionPricing = new SubscriptionPricing(data);
  const savedSubscriptionPricing = await newSubscriptionPricing.save();
  return savedSubscriptionPricing;
};

/**
 * Service function to update a single subscriptionPricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPricing to update.
 * @param {UpdateSubscriptionPricingInput} data - The updated data for the subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscriptionPricing.
 */
const updateSubscriptionPricing = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionPricing = await SubscriptionPricing.findOne({
    /* filedName: data.filedName, */
    subscriptionPlanId: data.subscriptionPlanId,
    subscriptionDurationId: data.subscriptionDurationId,
  });
  // Prevent duplicate updates
  if (existingSubscriptionPricing) {
    throw new Error(
      'Duplicate detected: Another subscriptionPricing with the same fieldName already exists.'
    );
  }
  // Proceed to update the subscriptionPricing
  const updatedSubscriptionPricing = await SubscriptionPricing.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionPricing;
};

/**
 * Service function to delete a single subscriptionPricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The deleted subscriptionPricing.
 */
const deleteSubscriptionPricing = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPricing | null>> => {
  const deletedSubscriptionPricing = await SubscriptionPricing.findByIdAndDelete(id);
  return deletedSubscriptionPricing;
};

/**
 * Service function to delete multiple subscriptionPricing.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscriptionPricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The deleted subscriptionPricing.
 */
const deleteManySubscriptionPricing = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionPricing>[]> => {
  console.log(ids);
  const subscriptionPricingToDelete = await SubscriptionPricing.find({ _id: { $in: ids } });
  if (!subscriptionPricingToDelete.length)
    throw new Error('No subscriptionPricing found to delete');
  await SubscriptionPricing.deleteMany({ _id: { $in: ids } });
  return subscriptionPricingToDelete;
};

/**
 * Service function to retrieve a single subscriptionPricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPricing to retrieve.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The retrieved subscriptionPricing.
 */
const getSubscriptionPricingById = async (
  id: string
): Promise<Partial<ISubscriptionPricing> | null> => {
  // Check if valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }

  const objectId = new mongoose.Types.ObjectId(id);

  // Search by _id OR subscriptionPlanId OR subscriptionDurationId
  const subscriptionPricing = await SubscriptionPricing.findById(objectId);

  return subscriptionPricing;
};

/**
 * Service function to retrieve multiple subscriptionPricing based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The retrieved subscriptionPricing
 */
const getManySubscriptionPricing = async (
  query: SearchQueryInput
): Promise<{
  subscriptionPricings: Partial<ISubscriptionPricing>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      // { fieldName: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed

      { currency: { $regex: searchKey, $options: 'i' } },
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscriptionPricing
  const totalData = await SubscriptionPricing.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscriptionPricing based on the search filter with pagination
  const subscriptionPricings = await SubscriptionPricing.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionPricings, totalData, totalPages };
};

export const subscriptionPricingServices = {
  createSubscriptionPricing,
  updateSubscriptionPricing,
  deleteSubscriptionPricing,
  deleteManySubscriptionPricing,
  getSubscriptionPricingById,
  getManySubscriptionPricing,
};

