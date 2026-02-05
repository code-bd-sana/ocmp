// Import the model

import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import SubscriptionPlan, {
  ISubscriptionPlan,
} from '../../models/subscription-billing/subscriptionPlan.schema';
import {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from './subscription-plan.validation';

/**
 * Service function to create a new subscriptionPlan.
 *
 * @param {CreateSubscriptionPlanInput} data - The data to create a new subscriptionPlan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The created subscriptionPlan.
 */
const createSubscriptionPlan = async (
  data: CreateSubscriptionPlanInput
): Promise<Partial<ISubscriptionPlan>> => {
  // Check if the subscription plan already exists
  const existingPlan = await SubscriptionPlan.findOne({ name: data.name });

  // If the plan exists, throw a 500 Bad Request error
  if (existingPlan) {
    throw new Error('Subscription plan already exists');
  }
  const newSubscriptionPlan = new SubscriptionPlan(data);
  const savedSubscriptionPlan = await newSubscriptionPlan.save();
  return savedSubscriptionPlan;
};

/**
 * Service function to update a single subscriptionPlan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPlan to update.
 * @param {UpdateSubscriptionPlanInput} data - The updated data for the subscriptionPlan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The updated subscriptionPlan.
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
        /* filedName: data.filedName, */ name: data.name,
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionPlan) {
    throw new Error(
      'Duplicate detected: Another subscriptionPlan with the same fieldName already exists.'
    );
  }

  //! If This subscirption e already kono user niye thake thaole name paln type applicableAccountType isActive update kora jabe na  -- > only allow update description

  // TODO:First chcekc if any user purches this subscirption price
  // TODO: if(!purches) => then name, plantype applicableaccount not allow to update4

  // Proceed to update the subscriptionPlan
  const updatedSubscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
  return updatedSubscriptionPlan;
};

/**
 * Service function to delete a single subscriptionPlan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPlan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The deleted subscriptionPlan.
 */
const deleteSubscriptionPlan = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPlan | null>> => {
  // ! if any user purchesd this plan already then not allowd to delete this plan
  // TODO: First chcek any user purched!
  // TODO: if alrady purched then 500 not allowed
  const deletedSubscriptionPlan = await SubscriptionPlan.findByIdAndDelete(id);
  return deletedSubscriptionPlan;
};

/**
 * Service function to delete multiple subscriptionPlan.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscriptionPlan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The deleted subscriptionPlan.
 */
const deleteManySubscriptionPlan = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionPlan>[]> => {
  const subscriptionPlanToDelete = await SubscriptionPlan.find({ _id: { $in: ids } });
  if (!subscriptionPlanToDelete.length) throw new Error('No subscriptionPlan found to delete');
  await SubscriptionPlan.deleteMany({ _id: { $in: ids } });
  return subscriptionPlanToDelete;
};

/**
 * Service function to retrieve a single subscriptionPlan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPlan to retrieve.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The retrieved subscriptionPlan.
 */
const getSubscriptionPlanById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPlan | null>> => {
  const subscriptionPlan = await SubscriptionPlan.findById(id);
  return subscriptionPlan;
};

/**
 * Service function to retrieve multiple subscriptionPlan based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscriptionPlan.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The retrieved subscriptionPlan
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
  // Find the total count of matching subscriptionPlan
  const totalData = await SubscriptionPlan.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscriptionPlan based on the search filter with pagination
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
