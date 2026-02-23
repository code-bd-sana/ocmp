// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import VehicleModel, {
  IVehicle,
  OwnerShipStatus,
} from '../../models/vehicle-transport/vehicle.schema';
import {
  CreateVehicleAsStandAloneInput,
  CreateVehicleAsTransportManagerInput,
  UpdateVehicleInput,
} from './vehicle.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service function to create a new vehicle.
 *
 * @param {CreateVehicleAsStandAloneInput | CreateVehicleAsTransportManagerInput} data - The data to create a new vehicle.
 * @returns {Promise<Partial<IVehicle>>} - The created vehicle.
 */
const createVehicle = async (
  data: CreateVehicleAsStandAloneInput | CreateVehicleAsTransportManagerInput
): Promise<Partial<IVehicle>> => {
  // Prevent duplicates by vehicleRegId or licensePlate (case-insensitive)
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

  // TODO: ATTACHMENTS Left

  const newVehicle = new VehicleModel(data);
  const savedVehicle = await newVehicle.save();
  return savedVehicle;
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
  data: UpdateVehicleInput,
  userId: IdOrIdsInput['id']
): Promise<Partial<IVehicle | null>> => {
  // Build $or conditions only for fields provided in `data`
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const orConditions: any[] = [];
  if (data.vehicleRegId)
    orConditions.push({
      vehicleRegId: { $regex: new RegExp(`^${escapeRegex(data.vehicleRegId)}$`, 'i') },
    });
  if (data.licensePlate)
    orConditions.push({
      licensePlate: { $regex: new RegExp(`^${escapeRegex(data.licensePlate)}$`, 'i') },
    });
  if (data.status)
    orConditions.push({
      status: data.status,
    });

  if (data.additionalDetails) {
    if (data.additionalDetails.lastServiceDate)
      orConditions.push({
        'additionalDetails.lastServiceDate': data.additionalDetails.lastServiceDate,
      });

    if (data.additionalDetails.nextServiceDate)
      orConditions.push({
        'additionalDetails.nextServiceDate': data.additionalDetails.nextServiceDate,
      });

    if (data.additionalDetails.grossPlatedWeight)
      orConditions.push({
        'additionalDetails.grossPlatedWeight': data.additionalDetails.grossPlatedWeight,
      });

    if (data.additionalDetails.ownerShipStatus)
      orConditions.push({
        'additionalDetails.ownerShipStatus': data.additionalDetails
          .ownerShipStatus as OwnerShipStatus,
      });

    if (data.additionalDetails.diskNumber)
      orConditions.push({
        'additionalDetails.diskNumber': data.additionalDetails.diskNumber,
      });

    if (data.additionalDetails.dateLeft)
      orConditions.push({
        'additionalDetails.dateLeft': data.additionalDetails.dateLeft,
      });

    if (data.additionalDetails.chassisNumber)
      orConditions.push({
        'additionalDetails.chassisNumber': data.additionalDetails.chassisNumber,
      });

    if (data.additionalDetails.keysAvailable)
      orConditions.push({
        'additionalDetails.keysAvailable': data.additionalDetails.keysAvailable,
      });

    if (data.additionalDetails.v5InName !== undefined)
      orConditions.push({
        'additionalDetails.v5InName': data.additionalDetails.v5InName,
      });

    if (data.additionalDetails.plantingCertificate !== undefined)
      orConditions.push({
        'additionalDetails.plantingCertificate': data.additionalDetails.plantingCertificate,
      });

    if (data.additionalDetails.vedExpiry)
      orConditions.push({
        'additionalDetails.vedExpiry': data.additionalDetails.vedExpiry,
      });

    if (data.additionalDetails.insuranceExpiry)
      orConditions.push({
        'additionalDetails.insuranceExpiry': data.additionalDetails.insuranceExpiry,
      });

    if (data.additionalDetails.serviceDueDate)
      orConditions.push({
        'additionalDetails.serviceDueDate': data.additionalDetails.serviceDueDate,
      });
  }

  if (data.driverPack !== undefined)
    orConditions.push({
      driverPack: data.driverPack,
    });

  if (data.notes)
    orConditions.push({
      notes: data.notes,
    });

  // convert into mongo Id
  if (Array.isArray(data.driverIds) && data.driverIds.length > 0) {
    orConditions.push({
      driverIds: { $all: data.driverIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });
  }

  // TODO: ATTACHMENTS Left

  if (orConditions.length > 0) {
    const existingVehicle = await VehicleModel.findOne({
      _id: { $ne: id }, // Exclude the current document
      $or: [
        {
          vehicleRegId: data.vehicleRegId
            ? { $regex: new RegExp(`^${escapeRegex(data.vehicleRegId)}$`, 'i') }
            : undefined,
        },
        {
          licensePlate: data.licensePlate
            ? { $regex: new RegExp(`^${escapeRegex(data.licensePlate)}$`, 'i') }
            : undefined,
        },
      ],
    }).lean();
    if (existingVehicle) {
      throw new Error(
        'Duplicate detected: Another vehicle with the same vehicleRegId or licensePlate already exists.'
      );
    }
  }
  // Proceed to update the vehicle
  const updatedVehicle = await VehicleModel.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { 'additionalDetails.createdBy': new mongoose.Types.ObjectId(userId) },
      ],
    },
    data,
    { new: true }
  );

  return updatedVehicle;
};

/**
 * Service function to delete a single vehicle by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to delete.
 * @returns {Promise<Partial<IVehicle>>} - The deleted vehicle.
 */
const deleteVehicle = async (id: IdOrIdsInput['id']): Promise<Partial<IVehicle | null>> => {
  // TODO: Can't delete if associated with fuel usage, tachograph, etc. (if any association exists)

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
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getManyVehicle,
};
