// Import the model
import mongoose from 'mongoose';
import TestingModel, { ITesting } from './testing.model';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateTestingInput,
  CreateManyTestingInput,
  UpdateTestingInput,
  UpdateManyTestingInput,
} from './testing.validation';

/**
 * Service function to create a new testing.
 *
 * @param {CreateTestingInput} data - The data to create a new testing.
 * @returns {Promise<Partial<ITesting>>} - The created testing.
 */
const createTesting = async (data: CreateTestingInput): Promise<Partial<ITesting>> => {
  const newTesting = new TestingModel(data);
  const savedTesting = await newTesting.save();
  return savedTesting;
};

/**
 * Service function to create multiple testing.
 *
 * @param {CreateManyTestingInput} data - An array of data to create multiple testing.
 * @returns {Promise<Partial<ITesting>[]>} - The created testing.
 */
const createManyTesting = async (data: CreateManyTestingInput): Promise<Partial<ITesting>[]> => {
  const createdTesting = await TestingModel.insertMany(data);
  return createdTesting;
};

/**
 * Service function to update a single testing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the testing to update.
 * @param {UpdateTestingInput} data - The updated data for the testing.
 * @returns {Promise<Partial<ITesting>>} - The updated testing.
 */
const updateTesting = async (id: IdOrIdsInput['id'], data: UpdateTestingInput): Promise<Partial<ITesting | null>> => {
  // Check for duplicate (filed) combination
  const existingTesting = await TestingModel.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [{ /* filedName: data.filedName, */ }],
  }).lean();
  // Prevent duplicate updates
  if (existingTesting) {
    throw new Error('Duplicate detected: Another testing with the same fieldName already exists.');
  }
  // Proceed to update the testing
  const updatedTesting = await TestingModel.findByIdAndUpdate(id, data, { new: true });
  return updatedTesting;
};

/**
 * Service function to update multiple testing.
 *
 * @param {UpdateManyTestingInput} data - An array of data to update multiple testing.
 * @returns {Promise<Partial<ITesting>[]>} - The updated testing.
 */
const updateManyTesting = async (data: UpdateManyTestingInput): Promise<Partial<ITesting>[]> => {
// Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingTesting = await TestingModel.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingTesting.length > 0) {
    throw new Error(
      'Duplicate detected: One or more testing with the same fieldName already exist.'
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
  const bulkResult = await TestingModel.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await TestingModel.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ITesting>[];
};

/**
 * Service function to delete a single testing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the testing to delete.
 * @returns {Promise<Partial<ITesting>>} - The deleted testing.
 */
const deleteTesting = async (id: IdOrIdsInput['id']): Promise<Partial<ITesting | null>> => {
  const deletedTesting = await TestingModel.findByIdAndDelete(id);
  return deletedTesting;
};

/**
 * Service function to delete multiple testing.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of testing to delete.
 * @returns {Promise<Partial<ITesting>[]>} - The deleted testing.
 */
const deleteManyTesting = async (ids: IdOrIdsInput['ids']): Promise<Partial<ITesting>[]> => {
  const testingToDelete = await TestingModel.find({ _id: { $in: ids } });
  if (!testingToDelete.length) throw new Error('No testing found to delete');
  await TestingModel.deleteMany({ _id: { $in: ids } });
  return testingToDelete; 
};

/**
 * Service function to retrieve a single testing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the testing to retrieve.
 * @returns {Promise<Partial<ITesting>>} - The retrieved testing.
 */
const getTestingById = async (id: IdOrIdsInput['id']): Promise<Partial<ITesting | null>> => {
  const testing = await TestingModel.findById(id);
  return testing;
};

/**
 * Service function to retrieve multiple testing based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering testing.
 * @returns {Promise<Partial<ITesting>[]>} - The retrieved testing
 */
const getManyTesting = async (query: SearchQueryInput): Promise<{ testings: Partial<ITesting>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching testing
  const totalData = await TestingModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find testing based on the search filter with pagination
  const testings = await TestingModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { testings, totalData, totalPages };
};

export const testingServices = {
  createTesting,
  createManyTesting,
  updateTesting,
  updateManyTesting,
  deleteTesting,
  deleteManyTesting,
  getTestingById,
  getManyTesting,
};