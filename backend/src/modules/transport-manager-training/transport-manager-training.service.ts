// Import the model
import mongoose from 'mongoose';
import TransportManagerTrainingModel, {
  ITransportManagerTraining,
} from '../../models/training/transportManagerTraining.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateTransportManagerTrainingInput,
  UpdateTransportManagerTrainingInput,
} from './transport-manager-training.validation';

const normalizeCreatePayload = (data: CreateTransportManagerTrainingInput) => ({
  ...data,
  attachments: data.attachments?.map((attachmentId) => new mongoose.Types.ObjectId(attachmentId)),
});

const normalizeUpdatePayload = (data: UpdateTransportManagerTrainingInput) => ({
  ...data,
  attachments: data.attachments?.map((attachmentId) => new mongoose.Types.ObjectId(attachmentId)),
});

/**
 * Service function to create a new transport-manager-training.
 *
 * @param {CreateTransportManagerTrainingInput} data - The data to create a new transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The created transport-manager-training.
 */
const createTransportManagerTraining = async (
  data: CreateTransportManagerTrainingInput,
  userId: IdOrIdsInput['id']
): Promise<Partial<ITransportManagerTraining>> => {
  const newTransportManagerTraining = new TransportManagerTrainingModel({
    ...normalizeCreatePayload(data),
    createdBy: new mongoose.Types.ObjectId(userId),
  });
  const savedTransportManagerTraining = await newTransportManagerTraining.save();
  return savedTransportManagerTraining;
};

/**
 * Service function to update a single transport-manager-training by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to update.
 * @param {UpdateTransportManagerTrainingInput} data - The updated data for the transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The updated transport-manager-training.
 */
const updateTransportManagerTraining = async (
  id: IdOrIdsInput['id'],
  data: UpdateTransportManagerTrainingInput,
  userId: IdOrIdsInput['id']
): Promise<Partial<ITransportManagerTraining | null>> => {
  const updatedTransportManagerTraining = await TransportManagerTrainingModel.findOneAndUpdate(
    {
      _id: id,
      createdBy: new mongoose.Types.ObjectId(userId),
    },
    normalizeUpdatePayload(data),
    { new: true }
  );

  return updatedTransportManagerTraining;
};

/**
 * Service function to delete a single transport-manager-training by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to delete.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The deleted transport-manager-training.
 */
const deleteTransportManagerTraining = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id']
): Promise<Partial<ITransportManagerTraining | null>> => {
  const deletedTransportManagerTraining = await TransportManagerTrainingModel.findOneAndDelete({
    _id: id,
    createdBy: new mongoose.Types.ObjectId(userId),
  });
  return deletedTransportManagerTraining;
};

/**
 * Service function to retrieve a single transport-manager-training by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to retrieve.
 * @returns {Promise<Partial<ITransportManagerTraining>>} - The retrieved transport-manager-training.
 */
const getTransportManagerTrainingById = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id']
): Promise<Partial<ITransportManagerTraining | null>> => {
  const transportManagerTraining = await TransportManagerTrainingModel.findOne({
    _id: id,
    createdBy: new mongoose.Types.ObjectId(userId),
  });
  return transportManagerTraining;
};

/**
 * Service function to retrieve multiple transport-manager-training based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering transport-manager-training.
 * @returns {Promise<Partial<ITransportManagerTraining>[]>} - The retrieved transport-manager-training
 */
const getManyTransportManagerTraining = async (
  query: SearchQueryInput,
  userId: IdOrIdsInput['id']
): Promise<{
  transportManagerTrainings: Partial<ITransportManagerTraining>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchConditions = [
    { name: { $regex: searchKey, $options: 'i' } },
    { trainingCourse: { $regex: searchKey, $options: 'i' } },
    { unitTitle: { $regex: searchKey, $options: 'i' } },
  ];

  const searchFilter: any = {
    createdBy: new mongoose.Types.ObjectId(userId),
  };

  if (searchKey?.trim()) {
    searchFilter.$or = searchConditions;
  }
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
  updateTransportManagerTraining,
  deleteTransportManagerTraining,
  getTransportManagerTrainingById,
  getManyTransportManagerTraining,
};

