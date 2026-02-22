// Import the model
import mongoose, { Mongoose } from 'mongoose';
import DriverModel, { IDriver } from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateDriverAsTransportManagerInput,
  CreateDriverAsStandAloneInput,
  UpdateDriverInput,
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
  data: UpdateDriverInput,
  userId: string
): Promise<Partial<IDriver | null>> => {
  // Build $or conditions only for fields provided in `data`
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const orConditions: any[] = [];

  if (data.licenseNumber) {
    orConditions.push({
      licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') },
    });
  }
  if (data.niNumber) {
    orConditions.push({ niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } });
  }
  if (data.postCode) {
    orConditions.push({ postCode: { $regex: new RegExp(`^${escapeRegex(data.postCode)}$`, 'i') } });
  }
  if (data.nextCheckDueDate) orConditions.push({ nextCheckDueDate: data.nextCheckDueDate });
  if (data.licenseExpiry) orConditions.push({ licenseExpiry: data.licenseExpiry });
  if (data.licenseExpiryDTC) orConditions.push({ licenseExpiryDTC: data.licenseExpiryDTC });
  if (data.cpcExpiry) orConditions.push({ cpcExpiry: data.cpcExpiry });
  if (typeof data.points !== 'undefined') orConditions.push({ points: data.points });
  if (Array.isArray(data.endorsementCodes) && data.endorsementCodes.length)
    orConditions.push({ endorsementCodes: { $all: data.endorsementCodes } });
  if (data.lastChecked) orConditions.push({ lastChecked: data.lastChecked });
  if (typeof data.checkFrequencyDays !== 'undefined')
    orConditions.push({ checkFrequencyDays: data.checkFrequencyDays });
  if (typeof data.employed !== 'undefined') orConditions.push({ employed: data.employed });
  if (data.checkStatus) orConditions.push({ checkStatus: data.checkStatus });
  if (Array.isArray(data.attachments) && data.attachments.length)
    orConditions.push({ attachments: { $all: data.attachments } });

  if (orConditions.length > 0) {
    const existingDriver = await DriverModel.findOne({
      _id: { $ne: id },
      $or: orConditions,
    }).lean();
    if (existingDriver) {
      throw new Error('Duplicate detected: Another driver with the same field(s) already exists.');
    }
  }
  // Proceed to update the driver
  const updatedDriver = await DriverModel.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { standAloneId: new mongoose.Types.ObjectId(userId) },
      ],
    },
    data,
    { new: true }
  );
  return updatedDriver;
};

/**
 * Service function to delete a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete.
 * @returns {Promise<Partial<IDriver>>} - The deleted driver.
 */
const deleteDriver = async (
  id: IdOrIdsInput['id'],
  userId: string
): Promise<Partial<IDriver | null>> => {
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

  const deletedDriver = await DriverModel.findOneAndDelete({
    _id: id,
    $or: [
      { createdBy: new mongoose.Types.ObjectId(userId) },
      { standAloneId: new mongoose.Types.ObjectId(userId) },
    ],
  });
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
  deleteDriver,
  getDriverById,
  getManyDriver,
};

