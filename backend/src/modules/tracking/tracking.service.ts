// Import the model
import mongoose from 'mongoose';
import TrackingModel, { ITracking } from './tracking.model';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateTrackingInput,
  CreateManyTrackingInput,
  UpdateTrackingInput,
  UpdateManyTrackingInput,
} from './tracking.validation';

/**
 * Service function to create a new tracking.
 *
 * @param {CreateTrackingInput} data - The data to create a new tracking.
 * @returns {Promise<Partial<ITracking>>} - The created tracking.
 */
const createTracking = async (data: CreateTrackingInput): Promise<Partial<ITracking>> => {
  const newTracking = new TrackingModel(data);
  const savedTracking = await newTracking.save();
  return savedTracking;
};

/**
 * Service function to create multiple tracking.
 *
 * @param {CreateManyTrackingInput} data - An array of data to create multiple tracking.
 * @returns {Promise<Partial<ITracking>[]>} - The created tracking.
 */
const createManyTracking = async (data: CreateManyTrackingInput): Promise<Partial<ITracking>[]> => {
  const createdTracking = await TrackingModel.insertMany(data);
  return createdTracking;
};

/**
 * Service function to update a single tracking by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the tracking to update.
 * @param {UpdateTrackingInput} data - The updated data for the tracking.
 * @returns {Promise<Partial<ITracking>>} - The updated tracking.
 */
const updateTracking = async (id: IdOrIdsInput['id'], data: UpdateTrackingInput): Promise<Partial<ITracking | null>> => {
  const updatedTracking = await TrackingModel.findByIdAndUpdate(id, data, { new: true });
  return updatedTracking;
};

/**
 * Service function to update multiple tracking.
 *
 * @param {UpdateManyTrackingInput} data - An array of data to update multiple tracking.
 * @returns {Promise<Partial<ITracking>[]>} - The updated tracking.
 */
const updateManyTracking = async (data: UpdateManyTrackingInput): Promise<Partial<ITracking>[]> => {
// Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (name or durationInDays) excluding the documents being updated
  const existingTracking = await TrackingModel.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName, $options: 'i' }, // case insensitive
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingTracking.length > 0) {
    throw new Error(
      'Duplicate detected: One or more tracking with the same fieldName already exist.'
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
  const bulkResult = await TrackingModel.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await TrackingModel.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ITracking>[];
};

/**
 * Service function to delete a single tracking by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the tracking to delete.
 * @returns {Promise<Partial<ITracking>>} - The deleted tracking.
 */
const deleteTracking = async (id: IdOrIdsInput['id']): Promise<Partial<ITracking | null>> => {
  const deletedTracking = await TrackingModel.findByIdAndDelete(id);
  return deletedTracking;
};

/**
 * Service function to delete multiple tracking.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of tracking to delete.
 * @returns {Promise<Partial<ITracking>[]>} - The deleted tracking.
 */
const deleteManyTracking = async (ids: IdOrIdsInput['ids']): Promise<Partial<ITracking>[]> => {
  const trackingToDelete = await TrackingModel.find({ _id: { $in: ids } });
  if (!trackingToDelete.length) throw new Error('No tracking found to delete');
  await TrackingModel.deleteMany({ _id: { $in: ids } });
  return trackingToDelete; 
};

/**
 * Service function to retrieve a single tracking by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the tracking to retrieve.
 * @returns {Promise<Partial<ITracking>>} - The retrieved tracking.
 */
const getTrackingById = async (id: IdOrIdsInput['id']): Promise<Partial<ITracking | null>> => {
  const tracking = await TrackingModel.findById(id);
  return tracking;
};

/**
 * Service function to retrieve multiple tracking based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering tracking.
 * @returns {Promise<Partial<ITracking>[]>} - The retrieved tracking
 */
const getManyTracking = async (query: SearchQueryInput): Promise<{ trackings: Partial<ITracking>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching tracking
  const totalData = await TrackingModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find tracking based on the search filter with pagination
  const trackings = await TrackingModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { trackings, totalData, totalPages };
};

export const trackingServices = {
  createTracking,
  createManyTracking,
  updateTracking,
  updateManyTracking,
  deleteTracking,
  deleteManyTracking,
  getTrackingById,
  getManyTracking,
};