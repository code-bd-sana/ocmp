// Import the model
import mongoose from 'mongoose';

import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import SubscriptionPlan, { ISubscriptionPlan } from '../../models/subscription-billing/subscriptionPlan.schema';
import {
  CreateSubscriptionPlanInput,
  UpdateManySubscriptionPlanInput,
  UpdateSubscriptionPlanInput
} from './subscription-plan.validation';

/**
 * Service function to create a new subscriptionPlan.
 *
 * @param {CreateSubscriptionPlanInput} data - The data to create a new subscriptionPlan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The created subscriptionPlan.
 */
const createSubscriptionPlan = async (data: CreateSubscriptionPlanInput): Promise<Partial<ISubscriptionPlan>> => {

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
const updateSubscriptionPlan = async (id: IdOrIdsInput['id'], data: UpdateSubscriptionPlanInput): Promise<Partial<ISubscriptionPlan | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionPlan = await SubscriptionPlan.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [{ /* filedName: data.filedName, */ }],
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionPlan) {
    throw new Error('Duplicate detected: Another subscriptionPlan with the same fieldName already exists.');
  }
  // Proceed to update the subscriptionPlan
  const updatedSubscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
  return updatedSubscriptionPlan;
};

/**
 * Service function to update multiple subscriptionPlan.
 *
 * @param {UpdateManySubscriptionPlanInput} data - An array of data to update multiple subscriptionPlan.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The updated subscriptionPlan.
 */
const updateManySubscriptionPlan = async (data: UpdateManySubscriptionPlanInput): Promise<Partial<ISubscriptionPlan>[]> => {
// Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingSubscriptionPlan = await SubscriptionPlan.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingSubscriptionPlan.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subscriptionPlan with the same fieldName already exist.'
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
 * Service function to delete a single subscriptionPlan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPlan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The deleted subscriptionPlan.
 */
const deleteSubscriptionPlan = async (id: IdOrIdsInput['id']): Promise<Partial<ISubscriptionPlan | null>> => {
  const deletedSubscriptionPlan = await SubscriptionPlan.findByIdAndDelete(id);
  return deletedSubscriptionPlan;
};

/**
 * Service function to delete multiple subscriptionPlan.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscriptionPlan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The deleted subscriptionPlan.
 */
const deleteManySubscriptionPlan = async (ids: IdOrIdsInput['ids']): Promise<Partial<ISubscriptionPlan>[]> => {
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
const getSubscriptionPlanById = async (id: IdOrIdsInput['id']): Promise<Partial<ISubscriptionPlan | null>> => {
  const subscriptionPlan = await SubscriptionPlan.findById(id);
  return subscriptionPlan;
};

/**
 * Service function to retrieve multiple subscriptionPlan based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscriptionPlan.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The retrieved subscriptionPlan
 */
const getManySubscriptionPlan = async (query: SearchQueryInput): Promise<{ subscriptionPlans: Partial<ISubscriptionPlan>[]; totalData: number; totalPages: number }> => {



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
  updateManySubscriptionPlan,
  deleteSubscriptionPlan,
  deleteManySubscriptionPlan,
  getSubscriptionPlanById,
  getManySubscriptionPlan,
};