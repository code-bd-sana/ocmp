// Import the model
import mongoose from 'mongoose';
import DriverModel, { IDriver } from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateDriverAsTransportManagerInput,
  CreateDriverAsStandAloneInput,
  UpdateDriverInput,
  UpdateManyDriverInput,
} from './driver.validation';
import { ClientManagement, ClientStatus } from '../../models';

/**
 * Service function to create a new driver as a Transport Manager.
 *
 * @param {CreateDriverAsTransportManagerInput} data - The data to create a new driver.
 * @param {string} userId - The transport manager's user ID.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 */
const createDriverAsTransportManager = async (
  data: CreateDriverAsTransportManagerInput,
  userId: string
): Promise<Partial<IDriver>> => {
  // Check for duplicate driver by licenseNumber or niNumber
  const existingDriver = await DriverModel.findOne({
    $or: [{ licenseNumber: data.licenseNumber }, { niNumber: data.niNumber }],
  });

  if (existingDriver) {
    throw new Error('Driver already exists');
  }

  const newDriver = new DriverModel(data);
  const savedDriver = await newDriver.save();
  return savedDriver;
};

const createDriverAsStandAlone = async (
  data: CreateDriverAsStandAloneInput
): Promise<Partial<IDriver>> => {
  const existingDriver = await DriverModel.findOne({
    $or: [{ licenseNumber: data.licenseNumber }, { niNumber: data.niNumber }],
  });

  if (existingDriver) {
    throw new Error('Driver already exists');
  }

  const newDriver = new DriverModel(data);
  const savedDriver = await newDriver.save();
  return savedDriver;
};

/**
 * Service function to update a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to update.
 * @param {UpdateDriverInput} data - The updated data for the driver.
 * @returns {Promise<Partial<IDriver>>} - The updated driver.
 */
const updateDriver = async (
  id: IdOrIdsInput['id'],
  data: UpdateDriverInput
): Promise<Partial<IDriver | null>> => {
  // Check for duplicate (filed) combination
  const existingDriver = await DriverModel.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingDriver) {
    throw new Error('Duplicate detected: Another driver with the same fieldName already exists.');
  }
  // Proceed to update the driver
  const updatedDriver = await DriverModel.findByIdAndUpdate(id, data, { new: true });
  return updatedDriver;
};

/**
 * Service function to update multiple driver.
 *
 * @param {UpdateManyDriverInput} data - An array of data to update multiple driver.
 * @returns {Promise<Partial<IDriver>[]>} - The updated driver.
 */
const updateManyDriver = async (data: UpdateManyDriverInput): Promise<Partial<IDriver>[]> => {
  // Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existingDriver = await DriverModel.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existingDriver.length > 0) {
    throw new Error(
      'Duplicate detected: One or more driver with the same fieldName already exist.'
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
  const bulkResult = await DriverModel.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await DriverModel.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<IDriver>[];
};

/**
 * Service function to delete a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete.
 * @returns {Promise<Partial<IDriver>>} - The deleted driver.
 */
const deleteDriver = async (id: IdOrIdsInput['id']): Promise<Partial<IDriver | null>> => {
  const deletedDriver = await DriverModel.findByIdAndDelete(id);
  return deletedDriver;
};

/**
 * Service function to delete multiple driver.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of driver to delete.
 * @returns {Promise<Partial<IDriver>[]>} - The deleted driver.
 */
const deleteManyDriver = async (ids: IdOrIdsInput['ids']): Promise<Partial<IDriver>[]> => {
  const driverToDelete = await DriverModel.find({ _id: { $in: ids } });
  if (!driverToDelete.length) throw new Error('No driver found to delete');
  await DriverModel.deleteMany({ _id: { $in: ids } });
  return driverToDelete;
};

/**
 * Service function to retrieve a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to retrieve.
 * @returns {Promise<Partial<IDriver>>} - The retrieved driver.
 */
const getDriverById = async (id: IdOrIdsInput['id']): Promise<Partial<IDriver | null>> => {
  const driver = await DriverModel.findById(id);
  return driver;
};

/**
 * Service function to retrieve multiple driver based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering driver.
 * @returns {Promise<Partial<IDriver>[]>} - The retrieved driver
 */
const getManyDriver = async (
  query: SearchQueryInput
): Promise<{ drivers: Partial<IDriver>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching driver
  const totalData = await DriverModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find drivers based on the search filter with pagination
  const drivers = await DriverModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { drivers, totalData, totalPages };
};

export const driverServices = {
  createDriverAsTransportManager,
  createDriverAsStandAlone,
  updateDriver,
  updateManyDriver,
  deleteDriver,
  deleteManyDriver,
  getDriverById,
  getManyDriver,
};

