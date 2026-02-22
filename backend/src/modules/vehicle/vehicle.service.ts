// Import the model
import mongoose from 'mongoose';
import VehicleModel, { IVehicle } from '../../models/vehicle-transport/vehicle.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.validation';

/**
 * Service function to create a new vehicle.
 *
 * @param {CreateVehicleInput} data - The data to create a new vehicle.
 * @returns {Promise<Partial<IVehicle>>} - The created vehicle.
 */
const createVehicle = async (data: CreateVehicleInput): Promise<Partial<IVehicle>> => {
  // Prevent duplicates by vehicleRegId or licensePlate (case-insensitive)
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const or: any[] = [];
  if (data.vehicleRegId) {
    or.push({ vehicleRegId: { $regex: new RegExp(`^${escapeRegex(data.vehicleRegId)}$`, 'i') } });
  }
  if (data.licensePlate) {
    or.push({ licensePlate: { $regex: new RegExp(`^${escapeRegex(data.licensePlate)}$`, 'i') } });
  }

  if (or.length > 0) {
    const existingVehicle = await VehicleModel.findOne({ $or: or }).lean();
    if (existingVehicle) throw new Error('Vehicle already exists');
  }

  const newVehicle = new VehicleModel(data);
  const savedVehicle = await newVehicle.save();
  return savedVehicle;
};

const createVehicleAsTransportManager = async (
  data: CreateVehicleInput,
  userId: string
): Promise<Partial<IVehicle>> => {
  // Optionally verify manager-client relationship here
  return createVehicle(data);
};

const createVehicleAsStandAlone = async (data: CreateVehicleInput): Promise<Partial<IVehicle>> => {
  return createVehicle(data);
};

/**
 * Service function to update a single vehicle by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to update.
 * @param {UpdateVehicleInput} data - The updated data for the vehicle.
 * @returns {Promise<Partial<IVehicle>>} - The updated vehicle.
 */
const updateVehicle = async (
  id: IdOrIdsInput['id'],
  data: UpdateVehicleInput
): Promise<Partial<IVehicle | null>> => {
  // Check for duplicate (filed) combination
  const existingVehicle = await VehicleModel.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingVehicle) {
    throw new Error('Duplicate detected: Another vehicle with the same fieldName already exists.');
  }
  // Proceed to update the vehicle
  const updatedVehicle = await VehicleModel.findByIdAndUpdate(id, data, { new: true });
  return updatedVehicle;
};

/**
 * Service function to delete a single vehicle by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to delete.
 * @returns {Promise<Partial<IVehicle>>} - The deleted vehicle.
 */
const deleteVehicle = async (id: IdOrIdsInput['id']): Promise<Partial<IVehicle | null>> => {
  const deletedVehicle = await VehicleModel.findByIdAndDelete(id);
  return deletedVehicle;
};

/**
 * Service function to retrieve a single vehicle by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to retrieve.
 * @returns {Promise<Partial<IVehicle>>} - The retrieved vehicle.
 */
const getVehicleById = async (id: IdOrIdsInput['id']): Promise<Partial<IVehicle | null>> => {
  const vehicle = await VehicleModel.findById(id);
  return vehicle;
};

/**
 * Service function to retrieve multiple vehicle based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering vehicle.
 * @returns {Promise<Partial<IVehicle>[]>} - The retrieved vehicle
 */
const getManyVehicle = async (
  query: SearchQueryInput
): Promise<{ vehicles: Partial<IVehicle>[]; totalData: number; totalPages: number }> => {
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
  // Find the total count of matching vehicle
  const totalData = await VehicleModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find vehicles based on the search filter with pagination
  const vehicles = await VehicleModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { vehicles, totalData, totalPages };
};

export const vehicleServices = {
  createVehicle,
  createVehicleAsTransportManager,
  createVehicleAsStandAlone,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getManyVehicle,
};

