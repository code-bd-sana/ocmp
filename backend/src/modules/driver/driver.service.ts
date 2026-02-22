// Import the model
import mongoose, { Mongoose } from 'mongoose';
import DriverModel, { IDriver } from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateDriverAsTransportManagerInput,
  CreateDriverAsStandAloneInput,
  UpdateDriverInput,
  UpdateManyDriverInput,
  SearchDriverQueryInput,
} from './driver.validation';
import { ClientManagement, ClientStatus, DriverTachograph, FuelUsage, Vehicle } from '../../models';

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
  const [driverTachographExists, fuelUsageExists, vehicleExists] = await Promise.all([
    DriverTachograph.exists({
      driverId: new mongoose.Types.ObjectId(id),
      tachographRecords: { $exists: true, $not: { $size: 0 } },
    }),
    FuelUsage.exists({
      driverId: new mongoose.Types.ObjectId(id),
      fuelUsageRecords: { $exists: true, $not: { $size: 0 } },
    }),
    Vehicle.exists({
      driverId: new mongoose.Types.ObjectId(id),
      assignedVehicles: { $exists: true, $not: { $size: 0 } },
    }),
  ]);

  // if any of the related records exist, prevent deletion and throw an error
  if (driverTachographExists || fuelUsageExists || vehicleExists) {
    throw new Error(
      'Cannot delete driver with associated tachograph records, fuel usage records, or assigned vehicles.'
    );
  }

  const deletedDriver = await DriverModel.findByIdAndDelete(id);
  return deletedDriver;
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
  query: SearchDriverQueryInput
): Promise<{
  drivers: Partial<IDriver>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId } = query;

  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  // Search filter
  if (searchKey) {
    searchConditions.push({
      $or: [
        { name: { $regex: searchKey, $options: 'i' } },
        { licenseNumber: { $regex: searchKey, $options: 'i' } },
        { niNumber: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  // Standalone filter (can be in standAloneId OR createdBy)
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);

    andConditions.push({
      $or: [{ standAloneId: objectId }, { createdBy: objectId }],
    });
  }

  // Final filter build
  const finalFilter: any = {};

  if (searchConditions.length) {
    finalFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    finalFilter.$and = [...(finalFilter.$and || []), ...andConditions];
  }

  // Pagination
  const skipItems = (pageNo - 1) * showPerPage;

  const totalData = await DriverModel.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalData / showPerPage);

  const drivers = await DriverModel.find(finalFilter).skip(skipItems).limit(showPerPage).select('');

  return { drivers, totalData, totalPages };
};

export const driverServices = {
  createDriverAsTransportManager,
  createDriverAsStandAlone,
  updateDriver,
  updateManyDriver,
  deleteDriver,
  getDriverById,
  getManyDriver,
};

