// Import the model

import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { ISubscriptionPlan, SubscriptionPlan } from '../../models';
import {
  CreateSubscriptionPlanInput,
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
  // Check if the subscription plan already exists
  const existingPlan = await SubscriptionPlan.findOne({ name: data.name });
  // If the plan exists
  if (existingPlan) {
    throw new Error('Subscription-plan already exists');
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
  // Check for duplicate (filed) combination
  const existingSubscriptionPlan = await SubscriptionPlan.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        name: data.name?.toUpperCase(),
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionPlan) {
    throw new Error(
      'Duplicate detected: Another subscription-plan with the same fieldName already exists.'
    );
  }

  // ! If this subscription plan is already purchased by any user then not allow to update name, planType, applicableAccountType

  // TODO:First chcekc if any user purches this subscirption price
  // TODO: if(!purches) => then name, plantype applicableaccount not allow to update4

  // Proceed to update the subscription-plan
  const updatedSubscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
  return updatedSubscriptionPlan;
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
  // ! if any user purchased this plan already then not allowed to delete this plan
  // TODO: First check any user purchased!
  // TODO: if already purchased then 500 not allowed
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
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The retrieved subscription-plans.
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
  // Find subscription-plans based on the search filter with pagination
  const subscriptionPlans = await SubscriptionPlan.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionPlans, totalData, totalPages };
};

export const subscriptionPlanServices = {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  deleteManySubscriptionPlan,
  getSubscriptionPlanById,
  getManySubscriptionPlan,
};
