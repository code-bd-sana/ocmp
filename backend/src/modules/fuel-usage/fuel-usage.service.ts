// Import the model
import mongoose from 'mongoose';
import FuelUsageSchema, { IFuelUsage } from '../../models/vehicle-transport/fuelUsage.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateFuelUsageAsManagerInput,
  CreateFuelUsageAsStandAloneInput,
  CreateFuelUsageInput,
  SearchFuelUsageInput,
  UpdateFuelUsageInput,
} from './fuel-usage.validation';
import { FuelUsage, Vehicle } from '../../models';

/**
 * Verifies the vehicle is assigned to the driver
 * The vehicle schema has `driverIds: ObjectId[]` field which contains the IDs of assigned drivers.
 *
 */

const verifyVehicleUnderDriver = async (driverId: string, vehicleId: string): Promise<void> => {
  const driverObjectId = new mongoose.Types.ObjectId(driverId);
  const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);

  // Confirm the driver exists
  const driverExists = await mongoose.model('Driver').exists({ _id: driverObjectId });
  if (!driverExists) {
    throw new Error('Driver not found');
  }

  // Confirm the vehicle exists and is assigned to the driver
  const vehicle = await Vehicle.exists({
    _id: vehicleObjectId,
    driverIds: driverObjectId,
  });
  if (!vehicle) {
    throw new Error('Vehicle not found or not assigned to the driver');
  }
};

// CREATE

/**
 * Service: Create a new fuel-usage record as a Transport Manager
 * - Verifies the vehicle is assigned to the driver before creating the fuel-usage record.
 *
 * @param {CreateFuelUsageAsManagerInput} data - The data for the new fuel-usage record.
 * @returns {Promise<IFuelUsage>} - The created fuel-usage record.
 * @throws {Error} - Throws an error if the vehicle is not assigned to the driver or if creation fails.
 */

const createFuelUsageAsManager = async (
  data: CreateFuelUsageAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IFuelUsage> => {
  // Verify the vehicle is assigned to the driver
  await verifyVehicleUnderDriver(data.driverId, data.vehicleId);

  const doc: Record<string, any> = {
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    driverId: new mongoose.Types.ObjectId(data.driverId),
    date: data.date,
    adBlueUsed: data.adBlueUsed,
    fuelUsed: data.fuelUsed,
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };

  const newDoc = await FuelUsage.create(doc);
  return newDoc.save();
};

/**
 * Service: Create a new fuel-usage record as a Standalone User
 * - Verifies the vehicle is assigned to the driver before creating the fuel-usage record.
 *
 * @param {CreateFuelUsageAsStandAloneInput} data - The data for the new fuel-usage record.
 * @returns {Promise<IFuelUsage>} - The created fuel-usage record.
 * @throws {Error} - Throws an error if the vehicle is not assigned to the driver or if creation fails.
 */

const createFuelUsageAsStandAlone = async (
  data: CreateFuelUsageAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IFuelUsage> => {
  // Verify the vehicle is assigned to the driver
  await verifyVehicleUnderDriver(data.driverId, data.vehicleId);

  const doc: Record<string, any> = {
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    driverId: new mongoose.Types.ObjectId(data.driverId),
    date: data.date,
    adBlueUsed: data.adBlueUsed,
    fuelUsed: data.fuelUsed,
    createdBy: data.createdBy,
  };

  const newDoc = await FuelUsage.create(doc);
  return newDoc.save();
};

/**
 * Service function to update a single fuel-usage by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to update.
 * @param {UpdateFuelUsageInput} data - The updated data for the fuel-usage.
 * @returns {Promise<Partial<IFuelUsage>>} - The updated fuel-usage.
 */
const updateFuelUsage = async (
  id: IdOrIdsInput['id'],
  data: UpdateFuelUsageInput
): Promise<Partial<IFuelUsage | null>> => {
  // Check for duplicate (filed) combination
  const existingFuelUsage = await FuelUsageSchema.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingFuelUsage) {
    throw new Error(
      'Duplicate detected: Another fuel-usage with the same fieldName already exists.'
    );
  }
  // Proceed to update the fuel-usage
  const updatedFuelUsage = await FuelUsageSchema.findByIdAndUpdate(id, data, { new: true });
  return updatedFuelUsage;
};

/**
 * Service function to delete a single fuel-usage by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to delete.
 * @returns {Promise<Partial<IFuelUsage>>} - The deleted fuel-usage.
 */
const deleteFuelUsage = async (id: IdOrIdsInput['id']): Promise<Partial<IFuelUsage | null>> => {
  const deletedFuelUsage = await FuelUsageSchema.findByIdAndDelete(id);
  return deletedFuelUsage;
};

/**
 * Service function to retrieve a single fuel-usage by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to retrieve.
 * @returns {Promise<Partial<IFuelUsage>>} - The retrieved fuel-usage.
 */
const getFuelUsageById = async (id: IdOrIdsInput['id']): Promise<Partial<IFuelUsage | null>> => {
  const fuelUsage = await FuelUsageSchema.findById(id);
  return fuelUsage;
};

/**
 * Service function to retrieve multiple fuel-usage based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering fuel-usage.
 * @returns {Promise<Partial<IFuelUsage>[]>} - The retrieved fuel-usage
 */
const getManyFuelUsage = async (
  query: SearchFuelUsageInput
): Promise<{ fuelUsages: Partial<IFuelUsage>[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  // Access Control
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    });
  }

  // Lookup driver details for search

  basePipeline.push(
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } }
  );

  // Search filter or driver fullName, vehicle vehicleRegId, complianceStatus
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { 'driver.fullName': { $regex: searchKey, $options: 'i' } },
          { 'vehicle.vehicleRegId': { $regex: searchKey, $options: 'i' } },
          { complianceStatus: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await FuelUsage.aggregate([
    ...basePipeline,
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (pageNo - 1) * showPerPage },
          { $limit: showPerPage },
        ],
      },
    },
  ]);

  const totalData = result?.metadata[0]?.total || 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { fuelUsages: result?.data || [], totalData, totalPages };
};

export const fuelUsageServices = {
  createFuelUsageAsManager,
  createFuelUsageAsStandAlone,
  updateFuelUsage,
  deleteFuelUsage,
  getFuelUsageById,
  getManyFuelUsage,
};

