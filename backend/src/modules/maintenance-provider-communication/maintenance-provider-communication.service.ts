// Import the model
import mongoose from 'mongoose';
import MaintenanceProviderCommunicationModel, {
  IMaintenanceProviderCommunication,
} from '../../models/maintenance/maintenance-provider-communication.schema';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import {
  CreateMaintenanceProviderCommunicationInput,
  SearchMaintenanceProviderCommunicationQueryInput,
  UpdateMaintenanceProviderCommunicationInput,
} from './maintenance-provider-communication.validation';

const buildAccessFilters = (id?: IdOrIdsInput['id']): Record<string, unknown>[] => {
  if (!id) {
    return [];
  }

  const normalizedId = String(id);
  const candidates: Array<string | mongoose.Types.ObjectId> = [normalizedId];
  if (mongoose.Types.ObjectId.isValid(normalizedId)) {
    candidates.unshift(new mongoose.Types.ObjectId(normalizedId));
  }

  return [{ createdBy: { $in: candidates } }, { standAloneId: { $in: candidates } }];
};

/**
 * Service function to create a new maintenance-provider-communication.
 *
 * @param {CreateMaintenanceProviderCommunicationInput} data - The data to create a new maintenance-provider-communication.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The created maintenance-provider-communication.
 */
const createMaintenanceProviderCommunication = async (
  data: CreateMaintenanceProviderCommunicationInput
): Promise<Partial<IMaintenanceProviderCommunication>> => {
  const newMaintenanceProviderCommunication = new MaintenanceProviderCommunicationModel(data);

  const savedMaintenanceProviderCommunication = await newMaintenanceProviderCommunication.save();
  return savedMaintenanceProviderCommunication;
};

/**
 * Service function to update a single maintenance-provider-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the maintenance-provider-communication to update.
 * @param {UpdateMaintenanceProviderCommunicationInput} data - The updated data for the maintenance-provider-communication.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The updated maintenance-provider-communication.
 */
const updateMaintenanceProviderCommunication = async (
  id: IdOrIdsInput['id'],
  data: UpdateMaintenanceProviderCommunicationInput,
  accessId: IdOrIdsInput['id']
): Promise<Partial<IMaintenanceProviderCommunication>> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(accessId);

  // Proceed to update the maintenance-provider-communication
  const updatedMaintenanceProviderCommunication =
    await MaintenanceProviderCommunicationModel.findOneAndUpdate(
      {
        _id: id,
        ...(accessFilters.length ? { $or: accessFilters } : {}),
      },
      data,
      { returnDocument: 'after' }
    );

  if (!updatedMaintenanceProviderCommunication) {
    throw new Error('Maintenance-provider-communication not found or access denied');
  }

  return updatedMaintenanceProviderCommunication;
};

/**
 * Service function to delete a single maintenance-provider-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the maintenance-provider-communication to delete.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The deleted maintenance-provider-communication.
 */
const deleteMaintenanceProviderCommunication = async (
  id: IdOrIdsInput['id'],
  accessId: IdOrIdsInput['id']
): Promise<void> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(accessId);

  const deletedMaintenanceProviderCommunication =
    await MaintenanceProviderCommunicationModel.findOneAndDelete({
      _id: id,
      ...(accessFilters.length ? { $or: accessFilters } : {}),
    });

  if (!deletedMaintenanceProviderCommunication) {
    throw new Error('Maintenance-provider-communication not found or access denied');
  }
};

/**
 * Service function to retrieve a single maintenance-provider-communication by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the maintenance-provider-communication to retrieve.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>>} - The retrieved maintenance-provider-communication.
 */
const getMaintenanceProviderCommunicationById = async (
  id: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id'],
  createdBy?: IdOrIdsInput['id']
): Promise<Partial<IMaintenanceProviderCommunication | null>> => {
  const accessFilters: Record<string, unknown>[] = [
    ...buildAccessFilters(standAloneId),
    ...buildAccessFilters(createdBy),
  ];

  const filter = accessFilters.length
    ? {
        _id: id,
        $or: accessFilters,
      }
    : { _id: id };

  const maintenanceProviderCommunication =
    await MaintenanceProviderCommunicationModel.findOne(filter);
  return maintenanceProviderCommunication;
};

/**
 * Service function to retrieve multiple maintenance-provider-communication based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering maintenance-provider-communication.
 * @returns {Promise<Partial<IMaintenanceProviderCommunication>[]>} - The retrieved maintenance-provider-communication
 */
const getAllMaintenanceProviderCommunication = async (
  query: SearchMaintenanceProviderCommunicationQueryInput & { createdBy?: string }
): Promise<{
  maintenanceProviderCommunications: Partial<IMaintenanceProviderCommunication>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query;
  // Build the search filter based on the search key
  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  if (searchKey) {
    searchConditions.push({
      $or: [
        { providerName: { $regex: searchKey, $options: 'i' } },
        { type: { $regex: searchKey, $options: 'i' } },
        { details: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  if (standAloneId) {
    const standaloneObjectId = new mongoose.Types.ObjectId(String(standAloneId));

    andConditions.push({
      $or: [{ standAloneId: standaloneObjectId }, { createdBy: standaloneObjectId }],
    });
  } else if (createdBy) {
    andConditions.push({ $or: buildAccessFilters(createdBy) });
  }

  const searchFilter: any = {};

  if (searchConditions.length) {
    searchFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    searchFilter.$and = [...(searchFilter.$and || []), ...andConditions];
  }
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching maintenance-provider-communication
  const totalData = await MaintenanceProviderCommunicationModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find maintenance-provider-communications based on the search filter with pagination
  const maintenanceProviderCommunications = await MaintenanceProviderCommunicationModel.find(
    searchFilter
  )
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { maintenanceProviderCommunications, totalData, totalPages };
};

export const maintenanceProviderCommunicationServices = {
  createMaintenanceProviderCommunication,
  updateMaintenanceProviderCommunication,
  deleteMaintenanceProviderCommunication,
  getMaintenanceProviderCommunicationById,
  getAllMaintenanceProviderCommunication,
};
