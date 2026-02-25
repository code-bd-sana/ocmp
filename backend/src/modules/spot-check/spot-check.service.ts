// Import the model
import mongoose from 'mongoose';
import SpotCheckModel, {
  ISpotCheck,
} from '../../models/compliance-enforcement-dvsa/spotCheck.schema';
import Vehicle from '../../models/vehicle-transport/vehicle.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateSpotCheckInput,
  CreateSpotCheckAsManagerInput,
  CreateSpotCheckAsStandAloneInput,
  UpdateSpotCheckInput,
} from './spot-check.validation';

/**
 * Service function to create a new spot-check.
 *
 * @param {CreateSpotCheckInput} data - The data to create a new spot-check.
 * @returns {Promise<Partial<ISpotCheck>>} - The created spot-check.
 */
const createSpotCheck = async (data: CreateSpotCheckInput): Promise<Partial<ISpotCheck>> => {
  const newSpotCheck = new SpotCheckModel(data);
  const savedSpotCheck = await newSpotCheck.save();
  return savedSpotCheck;
};

const createSpotCheckAsManager = async (
  data: CreateSpotCheckAsManagerInput
): Promise<Partial<ISpotCheck>> => {
  // verify vehicle exists
  const vehicle = await Vehicle.findById(data.vehicleId).lean();
  if (!vehicle) throw new Error('Vehicle does not exist');

  // owner can be standAloneId or createdBy
  const ownerId = vehicle.standAloneId
    ? vehicle.standAloneId.toString()
    : vehicle.createdBy.toString();
  if (String(data.standAloneId) !== ownerId) {
    throw new Error('Stand-alone user does not exist under this vehicle');
  }

  const newSpotCheck = new SpotCheckModel(data as any);
  const savedSpotCheck = await newSpotCheck.save();
  return savedSpotCheck;
};

const createSpotCheckAsStandAlone = async (
  data: CreateSpotCheckAsStandAloneInput
): Promise<Partial<ISpotCheck>> => {
  // verify vehicle exists
  const vehicle = await Vehicle.findById(data.vehicleId).lean();
  if (!vehicle) throw new Error('Vehicle does not exist');

  const ownerId = vehicle.standAloneId
    ? vehicle.standAloneId.toString()
    : vehicle.createdBy.toString();
  // createdBy must match ownerId (standalone user can only create for their own vehicles)
  if (String(data.createdBy) !== ownerId) {
    throw new Error('You are not the owner of this vehicle');
  }

  const newSpotCheck = new SpotCheckModel(data as any);
  const savedSpotCheck = await newSpotCheck.save();
  return savedSpotCheck;
};

/**
 * Service function to update a single spot-check by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to update.
 * @param {UpdateSpotCheckInput} data - The updated data for the spot-check.
 * @returns {Promise<Partial<ISpotCheck>>} - The updated spot-check.
 */
const updateSpotCheck = async (
  id: IdOrIdsInput['id'],
  data: UpdateSpotCheckInput
): Promise<Partial<ISpotCheck | null>> => {
  // Check for duplicate (filed) combination
  const existingSpotCheck = await SpotCheckModel.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        /* filedName: data.filedName, */
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSpotCheck) {
    throw new Error(
      'Duplicate detected: Another spot-check with the same fieldName already exists.'
    );
  }
  // Proceed to update the spot-check
  const updatedSpotCheck = await SpotCheckModel.findByIdAndUpdate(id, data, { new: true });
  return updatedSpotCheck;
};

/**
 * Service function to delete a single spot-check by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to delete.
 * @returns {Promise<Partial<ISpotCheck>>} - The deleted spot-check.
 */
const deleteSpotCheck = async (id: IdOrIdsInput['id']): Promise<Partial<ISpotCheck | null>> => {
  const deletedSpotCheck = await SpotCheckModel.findByIdAndDelete(id);
  return deletedSpotCheck;
};

/**
 * Service function to retrieve a single spot-check by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to retrieve.
 * @returns {Promise<Partial<ISpotCheck>>} - The retrieved spot-check.
 */
const getSpotCheckById = async (
  id: IdOrIdsInput['id'],
  accessId?: string
): Promise<Partial<ISpotCheck | null>> => {
  const spotCheck = await SpotCheckModel.findById(id).lean();
  if (!spotCheck) return null;
  if (accessId) {
    const accessIdStr = String(accessId);
    const ownerMatch =
      (spotCheck as any).standAloneId?.toString?.() === accessIdStr ||
      (spotCheck as any).createdBy?.toString?.() === accessIdStr;
    if (!ownerMatch) return null;
  }
  return spotCheck as any;
};

/**
 * Service function to retrieve multiple spot-check based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering spot-check.
 * @returns {Promise<Partial<ISpotCheck>[]>} - The retrieved spot-check
 */
const getManySpotCheck = async (
  query: SearchQueryInput
): Promise<{ spotChecks: Partial<ISpotCheck>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId } = query as any;
  const skipItems = (pageNo - 1) * showPerPage;

  const baseOr: any[] = [];
  // Add searchable fields here if needed

  const searchFilter: any = {};
  if (baseOr.length > 0) searchFilter.$or = baseOr;

  // If standAloneId filter is present, restrict to docs where createdBy OR standAloneId matches
  if (standAloneId) {
    searchFilter.$and = searchFilter.$and || [];
    searchFilter.$and.push({
      $or: [
        { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(standAloneId) },
      ],
    });
  }

  const totalData = await SpotCheckModel.countDocuments(searchFilter);
  const totalPages = Math.ceil(totalData / showPerPage);
  const spotChecks = await SpotCheckModel.find(searchFilter).skip(skipItems).limit(showPerPage);
  return { spotChecks, totalData, totalPages };
};

export const spotCheckServices = {
  createSpotCheck,
  createSpotCheckAsManager,
  createSpotCheckAsStandAlone,
  updateSpotCheck,
  deleteSpotCheck,
  getSpotCheckById,
  getManySpotCheck,
};

