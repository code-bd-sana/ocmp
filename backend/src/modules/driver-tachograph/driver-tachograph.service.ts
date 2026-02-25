// Import the model
import mongoose from 'mongoose';
import DriverTachographModel, {
  IDriverTachograph,
} from '../../models/vehicle-transport/driverTachograph.schema';
import Vehicle from '../../models/vehicle-transport/vehicle.schema';
import Driver from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateDriverTachographInput,
  CreateManyDriverTachographInput,
  UpdateDriverTachographInput,
  UpdateManyDriverTachographInput,
} from './driver-tachograph.validation';

const resolveOwnerId = (entity: any): string | null => {
  if (!entity) return null;
  return entity.standAloneId
    ? entity.standAloneId.toString()
    : entity.createdBy
      ? entity.createdBy.toString()
      : null;
};

const validateVehicleDriverAndOwner = async (
  vehicleId: string,
  driverId: string,
  standAloneId?: string
) => {
  const vehicle = await Vehicle.findById(vehicleId)
    .select('driverIds standAloneId createdBy')
    .lean();

  if (!vehicle) throw new Error('Vehicle does not exist');

  const isDriverAssignedToVehicle =
    Array.isArray((vehicle as any).driverIds) &&
    (vehicle as any).driverIds.some((assignedId: any) => assignedId?.toString?.() === driverId);

  if (!isDriverAssignedToVehicle) {
    throw new Error('Driver does not exist under this vehicle');
  }

  const driver = await Driver.findById(driverId).select('standAloneId createdBy').lean();

  if (standAloneId) {
    const vehicleOwnerId = resolveOwnerId(vehicle);
    if (!vehicleOwnerId) {
      throw new Error('standAloneId does not exist for this vehicle');
    }
    if (vehicleOwnerId !== standAloneId) {
      throw new Error('Provided standAloneId does not match vehicle and driver owner');
    }

    // If driver document exists, also verify same ownership; if not found,
    // vehicle->driver assignment check above remains the source of truth.
    if (driver) {
      const driverOwnerId = resolveOwnerId(driver);
      if (driverOwnerId && driverOwnerId !== standAloneId) {
        throw new Error('Provided standAloneId does not match vehicle and driver owner');
      }
    }
  }
};

/**
 * Service function to create a new driver-tachograph.
 *
 * @param {CreateDriverTachographInput} data - The data to create a new driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>>} - The created driver-tachograph.
 */
const createDriverTachograph = async (
  data: CreateDriverTachographInput
): Promise<Partial<IDriverTachograph>> => {
  const standAloneId = (data as any).standAloneId?.toString?.();
  await validateVehicleDriverAndOwner(
    data.vehicleId.toString(),
    data.driverId.toString(),
    standAloneId
  );

  const newDriverTachograph = new DriverTachographModel(data);
  const savedDriverTachograph = await newDriverTachograph.save();
  return savedDriverTachograph;
};

/**
 * Service function to update a single driver-tachograph by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to update.
 * @param {UpdateDriverTachographInput} data - The updated data for the driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>>} - The updated driver-tachograph.
 */
const updateDriverTachograph = async (
  id: IdOrIdsInput['id'],
  data: UpdateDriverTachographInput,
  standAloneId?: string
): Promise<Partial<IDriverTachograph | null>> => {
  const existing = await DriverTachographModel.findById(id).select('vehicleId driverId').lean();
  if (!existing) return null;

  const effectiveVehicleId = (data.vehicleId || (existing as any).vehicleId)?.toString();
  const effectiveDriverId = (data.driverId || (existing as any).driverId)?.toString();

  if (effectiveVehicleId && effectiveDriverId) {
    await validateVehicleDriverAndOwner(effectiveVehicleId, effectiveDriverId, standAloneId);
  }

  // Proceed to update the driver-tachograph
  const updatedDriverTachograph = await DriverTachographModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedDriverTachograph;
};

/**
 * Service function to delete a single driver-tachograph by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to delete.
 * @returns {Promise<Partial<IDriverTachograph>>} - The deleted driver-tachograph.
 */
const deleteDriverTachograph = async (
  id: IdOrIdsInput['id']
): Promise<Partial<IDriverTachograph | null>> => {
  const deletedDriverTachograph = await DriverTachographModel.findByIdAndDelete(id);
  return deletedDriverTachograph;
};

/**
 * Service function to retrieve a single driver-tachograph by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver-tachograph to retrieve.
 * @returns {Promise<Partial<IDriverTachograph>>} - The retrieved driver-tachograph.
 */
const getDriverTachographById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<IDriverTachograph | null>> => {
  const driverTachograph = await DriverTachographModel.findById(id);
  return driverTachograph;
};

/**
 * Service function to retrieve multiple driver-tachograph based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering driver-tachograph.
 * @returns {Promise<Partial<IDriverTachograph>[]>} - The retrieved driver-tachograph
 */
const getManyDriverTachograph = async (
  query: SearchQueryInput
): Promise<{
  driverTachographs: Partial<IDriverTachograph>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on searchable fields
  const baseOr = [
    { typeOfInfringement: { $regex: searchKey, $options: 'i' } },
    { details: { $regex: searchKey, $options: 'i' } },
    { actionTaken: { $regex: searchKey, $options: 'i' } },
  ];

  const searchFilter: any = {};
  if (searchKey && searchKey.trim()) {
    searchFilter.$or = baseOr;
  }
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching driver-tachograph
  const totalData = await DriverTachographModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find driver-tachographs based on the search filter with pagination
  const driverTachographs = await DriverTachographModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { driverTachographs, totalData, totalPages };
};

export const driverTachographServices = {
  createDriverTachograph,
  updateDriverTachograph,
  deleteDriverTachograph,
  getDriverTachographById,
  getManyDriverTachograph,
};

