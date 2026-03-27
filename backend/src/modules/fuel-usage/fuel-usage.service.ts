// Import the model
import mongoose from 'mongoose';
import FuelUsageSchema, { IFuelUsage } from '../../models/vehicle-transport/fuelUsage.schema';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import {
  CreateFuelUsageAsManagerInput,
  CreateFuelUsageAsStandAloneInput,
  SearchFuelUsageInput,
  UpdateFuelUsageInput,
} from './fuel-usage.validation';
import { Driver, FuelUsage, Vehicle } from '../../models';

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
  id: string,
  data: UpdateFuelUsageInput,
  accessId: string
): Promise<Partial<IFuelUsage | null>> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  // If either driverId or vehicleId changes, we need to verify the relationship
  if (data.driverId || data.vehicleId) {
    // Fetch the existing document to fill the unchanged side
    const existing = await FuelUsage.findOne({
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ standAloneId: objectId }, { createdBy: objectId }],
    });

    if (!existing) {
      throw new Error('Fuel-usage not found or access denied');
    }

    const driverId = data.driverId || existing.driverId.toString();
    const vehicleId = data.vehicleId || existing.vehicleId.toString();

    // Verify the vehicle is assigned to the driver
    await verifyVehicleUnderDriver(driverId, vehicleId);
  }

  const updatedFields: Record<string, any> = {};
  if (data.driverId) updatedFields.driverId = new mongoose.Types.ObjectId(data.driverId);
  if (data.vehicleId) updatedFields.vehicleId = new mongoose.Types.ObjectId(data.vehicleId);
  if (data.date) updatedFields.date = data.date;
  if (data.adBlueUsed !== undefined) updatedFields.adBlueUsed = data.adBlueUsed;
  if (data.fuelUsed !== undefined) updatedFields.fuelUsed = data.fuelUsed;

  const updated = await FuelUsage.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
      $or: [{ standAloneId: objectId }, { createdBy: objectId }],
    },
    { $set: updatedFields },
    { returnDocument: 'after' }
  );

  if (!updated) {
    throw new Error('Fuel-usage not found or access denied');
  }

  return updated;
};

/**
 * Service function to delete a single fuel-usage by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to delete.
 * @returns {Promise<Partial<IFuelUsage>>} - The deleted fuel-usage.
 */
const deleteFuelUsage = async (
  id: string,
  accessId: string
): Promise<Partial<IFuelUsage | null>> => {
  const existing = await FuelUsage.findOne({
    _id: new mongoose.Types.ObjectId(id),
    $or: [
      { standAloneId: new mongoose.Types.ObjectId(accessId) },
      { createdBy: new mongoose.Types.ObjectId(accessId) },
    ],
  });

  if (!existing) {
    throw new Error('Fuel-usage not found or access denied');
  }

  const objectId = new mongoose.Types.ObjectId(accessId);

  const deletedFuelUsage = await FuelUsageSchema.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    $or: [{ standAloneId: objectId }, { createdBy: objectId }],
  });
  if (!deletedFuelUsage) {
    throw new Error('Fuel-usage not found or access denied');
  }
  return deletedFuelUsage;
};

/**
 * Service function to retrieve a single fuel-usage by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to retrieve.
 * @returns {Promise<Partial<IFuelUsage>>} - The retrieved fuel-usage.
 */
const getFuelUsageById = async (
  id: IdOrIdsInput['id'],
  accessId?: string
): Promise<Partial<IFuelUsage | null>> => {
  const match: Record<string, any> = { _id: new mongoose.Types.ObjectId(id as string) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    match.$or = [{ standAloneId: objectId }, { createdBy: objectId }];
  }

  const result = await FuelUsage.aggregate([
    { $match: match },

    // Join Driver
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    // Join Vehicle
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicleDoc',
      },
    },
    { $unwind: { path: '$vehicleDoc', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        vehicleRegId: { $ifNull: ['$vehicleDoc.vehicleRegId', null] },
        vehicleType: { $ifNull: ['$vehicleDoc.vehicleType', null] },
        licensePlate: { $ifNull: ['$vehicleDoc.licensePlate', null] },
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
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

const getDriversWithVehicles = async (accessId: string): Promise<any[]> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const drivers = await Driver.aggregate([
    {
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        let: { driverId: '$_id' },
        pipeline: [
          { $match: { $expr: { $in: ['$$driverId', '$driverIds'] } } },
          {
            $project: {
              _id: 1,
              vehicleRegId: 1,
              vehicleType: 1,
              licensePlate: 1,
              status: 1,
            },
          },
        ],
        as: 'vehicles',
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return drivers;
};

export const fuelUsageServices = {
  createFuelUsageAsManager,
  createFuelUsageAsStandAlone,
  updateFuelUsage,
  deleteFuelUsage,
  getFuelUsageById,
  getManyFuelUsage,
  getDriversWithVehicles,
};
