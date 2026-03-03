// Import the model
import mongoose from 'mongoose';
import SelfService, {
  ISelfService,
} from '../../models/compliance-enforcement-dvsa/selfService.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateSelfServiceAsManagerInput,
  CreateSelfServiceAsStandAloneInput,
  CreateSelfServiceInput,
  UpdateSelfServiceInput,
} from './self-service.validation';

/**
 * Service function to create a new self-service.
 *
 * @param {CreateSelfServiceInput} data - The data to create a new self-service.
 * @returns {Promise<Partial<ISelfService>>} - The created self-service.
 */
const createSelfService = async (data: CreateSelfServiceInput): Promise<Partial<ISelfService>> => {
  const newSelfService = new SelfService(data);
  const savedSelfService = await newSelfService.save();
  return savedSelfService;
};

/**
 * Service function to create a new self-service as transport manager.
 *
 * @param {CreateSelfServiceAsManagerInput} data - The data to create a new self-service as transport manager.
 * @returns {Promise<Partial<ISelfService>>} - The created self-service.
 */

const createSelfServiceAsManager = async (
  data: CreateSelfServiceAsManagerInput
): Promise<Partial<ISelfService>> => {
  const newSelfService = new SelfService(data as any);
  const savedSelfService = await newSelfService.save();
  return savedSelfService;
};

/**
 * Service function to create a new self-service as stand-alone user.
 *
 * @param {CreateSelfServiceAsStandAloneInput} data - The data to create a new self-service as stand-alone user.
 * @returns {Promise<Partial<ISelfService>>} - The created self-service.
 */

const createSelfServiceAsStandAlone = async (
  data: CreateSelfServiceAsStandAloneInput
): Promise<Partial<ISelfService>> => {
  const newSelfService = new SelfService(data as any);
  const savedSelfService = await newSelfService.save();
  return savedSelfService;
};

/**
 * Service function to update a single self-service by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to update.
 * @param {UpdateSelfServiceInput} data - The updated data for the self-service.
 * @returns {Promise<Partial<ISelfService>>} - The updated self-service.
 */
const updateSelfService = async (
  id: IdOrIdsInput['id'],
  data: UpdateSelfServiceInput
): Promise<Partial<ISelfService | null>> => {
  // Check for duplicate (filed) combination
  const existingSelfService = await SelfService.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSelfService) {
    throw new Error(
      'Duplicate detected: Another self-service with the same fieldName already exists.'
    );
  }
  // Proceed to update the self-service
  const updatedSelfService = await SelfService.findByIdAndUpdate(id, data, { new: true });
  return updatedSelfService;
};

/**
 * Service function to delete a single self-service by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to delete.
 * @returns {Promise<Partial<ISelfService>>} - The deleted self-service.
 */
const deleteSelfService = async (id: IdOrIdsInput['id']): Promise<Partial<ISelfService | null>> => {
  const deletedSelfService = await SelfService.findByIdAndDelete(id);
  return deletedSelfService;
};

/**
 * Service function to retrieve a single self-service by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to retrieve.
 * @returns {Promise<Partial<ISelfService>>} - The retrieved self-service.
 */
const getSelfServiceById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISelfService | null>> => {
  const selfService = await SelfService.findById(id);
  return selfService;
};

/**
 * Service function to retrieve multiple self-service based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering self-service.
 * @returns {Promise<Partial<ISelfService>[]>} - The retrieved self-service
 */
const getManySelfService = async (
  query: SearchQueryInput
): Promise<{ selfServices: Partial<ISelfService>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching self-service
  const totalData = await SelfService.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find self-services based on the search filter with pagination
  const selfServices = await SelfService.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { selfServices, totalData, totalPages };
};

export const selfServiceServices = {
  createSelfService,
  createSelfServiceAsManager,
  createSelfServiceAsStandAlone,
  updateSelfService,
  deleteSelfService,
  getSelfServiceById,
  getManySelfService,
};

