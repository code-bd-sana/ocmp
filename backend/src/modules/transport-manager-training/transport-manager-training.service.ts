// Import the model
import mongoose from 'mongoose';
import TransportManagerTrainingModel, { ITransportManagerTraining } from './transport-manager-training.model';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateTransportManagerTrainingInput,
  CreateManyTransportManagerTrainingInput,
  UpdateTransportManagerTrainingInput,
  UpdateManyTransportManagerTrainingInput,
} from './transport-manager-training.validation';

/**
 * Service function to create a new transport-manager-training.
 *
 * @param {CreateTransportManagerTrainingInput} data - The data to create a new transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The created transport-manager-training.
 */
const createTransportManagerTraining = async (data: CreateTransportManagerTrainingInput): Promise<Partial<ITransportManagerTraining>> => {
  const newTransportManagerTraining = new TransportManagerTrainingModel(data);
  const savedTransportManagerTraining = await newTransportManagerTraining.save();
  return savedTransportManagerTraining;
};

/**
 * Service function to create multiple transport-manager-training.
 *
 * @param {CreateManyTransportManagerTrainingInput} data - An array of data to create multiple transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>[]>} - The created transport-manager-training.
 */
const createManyTransportManagerTraining = async (data: CreateManyTransportManagerTrainingInput): Promise<Partial<ITransportManagerTraining>[]> => {
  const createdTransportManagerTraining = await TransportManagerTrainingModel.insertMany(data);
  return createdTransportManagerTraining;
};

/**
 * Service function to update a single transport-manager-training by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to update.
 * @param {UpdateTransportManagerTrainingInput} data - The updated data for the transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The updated transport-manager-training.
 */
const updateTransportManagerTraining = async (id: IdOrIdsInput['id'], data: UpdateTransportManagerTrainingInput): Promise<Partial<ITransportManagerTraining | null>> => {
  // Check for duplicate (filed) combination
  const existingTransportManagerTraining = await TransportManagerTrainingModel.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [{ /* filedName: data.filedName, */ }],
  }).lean();
  // Prevent duplicate updates
  if (existingTransportManagerTraining) {
    throw new Error('Duplicate detected: Another transport-manager-training with the same fieldName already exists.');
  }
  // Proceed to update the transport-manager-training
  const updatedTransportManagerTraining = await TransportManagerTrainingModel.findByIdAndUpdate(id, data, { new: true });
  return updatedTransportManagerTraining;
};

/**
 * Service function to update multiple transport-manager-training.
 *
 * @param {UpdateManyTransportManagerTrainingInput} data - An array of data to update multiple transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>[]>} - The updated transport-manager-training.
 */
const updateManyTransportManagerTraining = async (data: UpdateManyTransportManagerTrainingInput): Promise<Partial<ITransportManagerTraining>[]> => {
// Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingTransportManagerTraining = await TransportManagerTrainingModel.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingTransportManagerTraining.length > 0) {
    throw new Error(
      'Duplicate detected: One or more transport-manager-training with the same fieldName already exist.'
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
  const bulkResult = await TransportManagerTrainingModel.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await TransportManagerTrainingModel.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<ITransportManagerTraining>[];
};

/**
 * Service function to delete a single transport-manager-training by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to delete.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The deleted transport-manager-training.
 */
const deleteTransportManagerTraining = async (id: IdOrIdsInput['id']): Promise<Partial<ITransportManagerTraining | null>> => {
  const deletedTransportManagerTraining = await TransportManagerTrainingModel.findByIdAndDelete(id);
  return deletedTransportManagerTraining;
};

/**
 * Service function to delete multiple transport-manager-training.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of transport-manager-training to delete.
 * @returns {Promise<Partial<ITransportManagerTraining>[]>} - The deleted transport-manager-training.
 */
const deleteManyTransportManagerTraining = async (ids: IdOrIdsInput['ids']): Promise<Partial<ITransportManagerTraining>[]> => {
  const transportManagerTrainingToDelete = await TransportManagerTrainingModel.find({ _id: { $in: ids } });
  if (!transportManagerTrainingToDelete.length) throw new Error('No transport-manager-training found to delete');
  await TransportManagerTrainingModel.deleteMany({ _id: { $in: ids } });
  return transportManagerTrainingToDelete; 
};

/**
 * Service function to retrieve a single transport-manager-training by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to retrieve.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The retrieved transport-manager-training.
 */
const getTransportManagerTrainingById = async (id: IdOrIdsInput['id']): Promise<Partial<ITransportManagerTraining | null>> => {
  const transportManagerTraining = await TransportManagerTrainingModel.findById(id);
  return transportManagerTraining;
};

/**
 * Service function to retrieve multiple transport-manager-training based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>[]>} - The retrieved transport-manager-training
 */
const getManyTransportManagerTraining = async (query: SearchQueryInput): Promise<{ transportManagerTrainings: Partial<ITransportManagerTraining>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching transport-manager-training
  const totalData = await TransportManagerTrainingModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find transport-manager-trainings based on the search filter with pagination
  const transportManagerTrainings = await TransportManagerTrainingModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { transportManagerTrainings, totalData, totalPages };
};

export const transportManagerTrainingServices = {
  createTransportManagerTraining,
  createManyTransportManagerTraining,
  updateTransportManagerTraining,
  updateManyTransportManagerTraining,
  deleteTransportManagerTraining,
  deleteManyTransportManagerTraining,
  getTransportManagerTrainingById,
  getManyTransportManagerTraining,
};