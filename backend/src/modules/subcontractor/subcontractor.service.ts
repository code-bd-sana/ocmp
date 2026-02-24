// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateSubcontractorInput,
  CreateManySubcontractorInput,
  UpdateSubcontractorInput,
  UpdateManySubcontractorInput,
} from './subcontractor.validation';
import { SubContractor, ISubContractor } from '../../models';

/**
 * Service function to create a new subcontractor.
 *
 * @param {CreateSubcontractorInput} data - The data to create a new subcontractor.
 * @returns {Promise<ISubContractor>} - The created subcontractor.
 */
const createSubcontractor = async (data: CreateSubcontractorInput): Promise<ISubContractor> => {
  const newSubcontractor = new SubContractor(data);
  const savedSubcontractor = await newSubcontractor.save();
  return savedSubcontractor;
};

/**
 * Service function to update a single subcontractor by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subcontractor to update.
 * @param {UpdateSubcontractorInput} data - The updated data for the subcontractor.
 * @returns {Promise<Partial<ISubContractor>>} - The updated subcontractor.
 */
const updateSubcontractor = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubcontractorInput
): Promise<Partial<ISubContractor | null>> => {
  // Check for duplicate (filed) combination
  const existingSubcontractor = await SubContractor.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSubcontractor) {
    throw new Error(
      'Duplicate detected: Another subcontractor with the same fieldName already exists.'
    );
  }
  // Proceed to update the subcontractor
  const updatedSubcontractor = await SubContractor.findByIdAndUpdate(id, data, { new: true });
  return updatedSubcontractor;
};

/**
 * Service function to update multiple subcontractor.
 *
 * @param {UpdateManySubcontractorInput} data - An array of data to update multiple subcontractor.
 * @returns {Promise<Partial<ISubContractor>[]>} - The updated subcontractor.
 */
const updateManySubcontractor = async (
  data: UpdateManySubcontractorInput
): Promise<Partial<ISubContractor>[]> => {
  // Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingSubcontractor = await SubContractor.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingSubcontractor.length > 0) {
    throw new Error(
      'Duplicate detected: One or more subcontractor with the same fieldName already exist.'
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
  const bulkResult = await SubContractor.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await SubContractor.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ISubContractor>[];
};

/**
 * Service function to delete a single subcontractor by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subcontractor to delete.
 * @returns {Promise<Partial<ISubContractor>>} - The deleted subcontractor.
 */
const deleteSubcontractor = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubContractor | null>> => {
  const deletedSubcontractor = await SubContractor.findByIdAndDelete(id);
  return deletedSubcontractor;
};

/**
 * Service function to delete multiple subcontractor.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subcontractor to delete.
 * @returns {Promise<Partial<ISubContractor>[]>} - The deleted subcontractor.
 */
const deleteManySubcontractor = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubContractor>[]> => {
  const subcontractorToDelete = await SubContractor.find({ _id: { $in: ids } });
  if (!subcontractorToDelete.length) throw new Error('No subcontractor found to delete');
  await SubContractor.deleteMany({ _id: { $in: ids } });
  return subcontractorToDelete;
};

/**
 * Service function to retrieve a single subcontractor by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subcontractor to retrieve.
 * @returns {Promise<Partial<ISubContractor>>} - The retrieved subcontractor.
 */
const getSubcontractorById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubContractor | null>> => {
  const subcontractor = await SubContractor.findById(id);
  return subcontractor;
};

/**
 * Service function to retrieve multiple subcontractor based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subcontractor.
 * @returns {Promise<Partial<ISubContractor>[]>} - The retrieved subcontractor
 */
const getManySubcontractor = async (
  query: SearchQueryInput
): Promise<{
  subcontractors: Partial<ISubContractor>[];
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
  // Find the total count of matching subcontractor
  const totalData = await SubContractor.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subcontractors based on the search filter with pagination
  const subcontractors = await SubContractor.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subcontractors, totalData, totalPages };
};

export const subcontractorServices = {
  createSubcontractor,
  updateSubcontractor,
  updateManySubcontractor,
  deleteSubcontractor,
  deleteManySubcontractor,
  getSubcontractorById,
  getManySubcontractor,
};

