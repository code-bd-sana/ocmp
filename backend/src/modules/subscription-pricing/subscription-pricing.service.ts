// Import the model
import mongoose from 'mongoose';
import SubscriptionPricingModel, { ISubscriptionPricing } from './subscription-pricing.model';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateSubscriptionPricingInput,
  CreateManySubscriptionPricingInput,
  UpdateSubscriptionPricingInput,
  UpdateManySubscriptionPricingInput,
} from './subscription-pricing.validation';

/**
 * Service function to create a new subscriptionPricing.
 *
 * @param {CreateSubscriptionPricingInput} data - The data to create a new subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscriptionPricing.
 */
const createSubscriptionPricing = async (data: CreateSubscriptionPricingInput): Promise<Partial<ISubscriptionPricing>> => {
  const newSubscriptionPricing = new SubscriptionPricingModel(data);
  const savedSubscriptionPricing = await newSubscriptionPricing.save();
  return savedSubscriptionPricing;
};

/**
 * Service function to create multiple subscriptionPricing.
 *
 * @param {CreateManySubscriptionPricingInput} data - An array of data to create multiple subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The created subscriptionPricing.
 */
const createManySubscriptionPricing = async (data: CreateManySubscriptionPricingInput): Promise<Partial<ISubscriptionPricing>[]> => {
  const createdSubscriptionPricing = await SubscriptionPricingModel.insertMany(data);
  return createdSubscriptionPricing;
};

/**
 * Service function to update a single subscriptionPricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPricing to update.
 * @param {UpdateSubscriptionPricingInput} data - The updated data for the subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscriptionPricing.
 */
const updateSubscriptionPricing = async (id: IdOrIdsInput['id'], data: UpdateSubscriptionPricingInput): Promise<Partial<ISubscriptionPricing | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionPricing = await SubscriptionPricingModel.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [{ /* filedName: data.filedName, */ }],
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionPricing) {
    throw new Error('Duplicate detected: Another subscriptionPricing with the same fieldName already exists.');
  }
  // Proceed to update the subscriptionPricing
  const updatedSubscriptionPricing = await SubscriptionPricingModel.findByIdAndUpdate(id, data, { new: true });
  return updatedSubscriptionPricing;
};

/**
 * Service function to update multiple subscriptionPricing.
 *
 * @param {UpdateManySubscriptionPricingInput} data - An array of data to update multiple subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The updated subscriptionPricing.
 */
const updateManySubscriptionPricing = async (data: UpdateManySubscriptionPricingInput): Promise<Partial<ISubscriptionPricing>[]> => {
// Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingSubscriptionPricing = await SubscriptionPricingModel.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingSubscriptionPricing.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subscriptionPricing with the same fieldName already exist.'
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
  const bulkResult = await SubscriptionPricingModel.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await SubscriptionPricingModel.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ISubscriptionPricing>[];
};

/**
 * Service function to delete a single subscriptionPricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The deleted subscriptionPricing.
 */
const deleteSubscriptionPricing = async (id: IdOrIdsInput['id']): Promise<Partial<ISubscriptionPricing | null>> => {
  const deletedSubscriptionPricing = await SubscriptionPricingModel.findByIdAndDelete(id);
  return deletedSubscriptionPricing;
};

/**
 * Service function to delete multiple subscriptionPricing.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscriptionPricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The deleted subscriptionPricing.
 */
const deleteManySubscriptionPricing = async (ids: IdOrIdsInput['ids']): Promise<Partial<ISubscriptionPricing>[]> => {
  const subscriptionPricingToDelete = await SubscriptionPricingModel.find({ _id: { $in: ids } });
  if (!subscriptionPricingToDelete.length) throw new Error('No subscriptionPricing found to delete');
  await SubscriptionPricingModel.deleteMany({ _id: { $in: ids } });
  return subscriptionPricingToDelete; 
};

/**
 * Service function to retrieve a single subscriptionPricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscriptionPricing to retrieve.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The retrieved subscriptionPricing.
 */
const getSubscriptionPricingById = async (id: IdOrIdsInput['id']): Promise<Partial<ISubscriptionPricing | null>> => {
  const subscriptionPricing = await SubscriptionPricingModel.findById(id);
  return subscriptionPricing;
};

/**
 * Service function to retrieve multiple subscriptionPricing based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscriptionPricing.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The retrieved subscriptionPricing
 */
const getManySubscriptionPricing = async (query: SearchQueryInput): Promise<{ subscriptionPricings: Partial<ISubscriptionPricing>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching subscriptionPricing
  const totalData = await SubscriptionPricingModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscriptionPricing based on the search filter with pagination
  const subscriptionPricings = await SubscriptionPricingModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionPricings, totalData, totalPages };
};

export const subscriptionPricingServices = {
  createSubscriptionPricing,
  createManySubscriptionPricing,
  updateSubscriptionPricing,
  updateManySubscriptionPricing,
  deleteSubscriptionPricing,
  deleteManySubscriptionPricing,
  getSubscriptionPricingById,
  getManySubscriptionPricing,
};