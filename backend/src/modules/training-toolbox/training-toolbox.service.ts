// Import the model
import mongoose from 'mongoose';
import TrainingToolboxModel, {
  ITrainingToolbox,
} from '../../models/vehicle-transport/trainingToolbox.schema';
import Driver from '../../models/vehicle-transport/driver.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { UserRole } from '../../models';
import {
  CreateTrainingToolboxInput,
  UpdateTrainingToolboxInput,
} from './training-toolbox.validation';

const resolveOwnerId = (entity: any): string | null => {
  if (!entity) return null;
  return entity.standAloneId
    ? entity.standAloneId.toString()
    : entity.createdBy
      ? entity.createdBy.toString()
      : null;
};

const validateDriverAndOwner = async (driverId: string, standAloneId?: string) => {
  const driver = await Driver.findById(driverId).select('standAloneId createdBy').lean();
  if (!driver) throw new Error('Driver does not exist');

  if (standAloneId) {
    const driverOwnerId = resolveOwnerId(driver);
    if (!driverOwnerId) {
      throw new Error('standAloneId does not exist for this driver');
    }
    if (driverOwnerId !== standAloneId) {
      throw new Error('Provided standAloneId does not match driver owner');
    }
  }
};

/**
 * Service function to create a new training-toolbox.
 *
 * @param {CreateTrainingToolboxInput} data - The data to create a new training-toolbox.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The created training-toolbox.
 */
const createTrainingToolbox = async (
  data: CreateTrainingToolboxInput
): Promise<Partial<ITrainingToolbox>> => {
  const standAloneId = (data as any).standAloneId?.toString?.();
  await validateDriverAndOwner(data.driverId.toString(), standAloneId);

  const newTrainingToolbox = new TrainingToolboxModel(data);
  const savedTrainingToolbox = await newTrainingToolbox.save();
  return savedTrainingToolbox;
};

/**
 * Service function to update a single training-toolbox by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to update.
 * @param {UpdateTrainingToolboxInput} data - The updated data for the training-toolbox.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The updated training-toolbox.
 */
const updateTrainingToolbox = async (
  id: IdOrIdsInput['id'],
  data: UpdateTrainingToolboxInput,
  userId: IdOrIdsInput['id'],
  standAloneId?: string
): Promise<Partial<ITrainingToolbox | null>> => {
  const existing = await TrainingToolboxModel.findById(id).select('driverId').lean();
  if (!existing) return null;

  const effectiveDriverId = (data.driverId || (existing as any).driverId)?.toString();
  const accessOwnerId = standAloneId || String(userId);

  if (effectiveDriverId) {
    await validateDriverAndOwner(effectiveDriverId, accessOwnerId);
  }

  // Proceed to update the training-toolbox
  const updatedTrainingToolbox = await TrainingToolboxModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedTrainingToolbox;
};

/**
 * Service function to delete a single training-toolbox by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to delete.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The deleted training-toolbox.
 */
const deleteTrainingToolbox = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id']
): Promise<Partial<ITrainingToolbox | null>> => {
  const existing = await TrainingToolboxModel.findById(id).select('driverId').lean();
  if (!existing) return null;

  const accessOwnerId = String(standAloneId || userId);
  await validateDriverAndOwner((existing as any).driverId?.toString(), accessOwnerId);

  const deletedTrainingToolbox = await TrainingToolboxModel.findByIdAndDelete(id);
  return deletedTrainingToolbox;
};

/**
 * Service function to retrieve a single training-toolbox by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the training-toolbox to retrieve.
 * @returns {Promise<Partial<ITrainingToolbox>>} - The retrieved training-toolbox.
 */
const getTrainingToolboxById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ITrainingToolbox | null>> => {
  const trainingToolbox = await TrainingToolboxModel.findById(id);
  return trainingToolbox;
};

/**
 * Service function to retrieve multiple training-toolbox based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering training-toolbox.
 * @returns {Promise<Partial<ITrainingToolbox>[]>} - The retrieved training-toolbox
 */
const getManyTrainingToolbox = async (
  query: SearchQueryInput & {
    standAloneId?: string;
    requesterId?: string;
    requesterRole?: UserRole;
  }
): Promise<{
  trainingToolboxs: Partial<ITrainingToolbox>[];
  totalData: number;
  totalPages: number;
}> => {
  const {
    searchKey = '',
    showPerPage = 10,
    pageNo = 1,
    standAloneId,
    requesterId,
    requesterRole,
  } = query;

  const matchStage: any = {};

  if (searchKey?.trim()) {
    matchStage.$or = [
      { toolboxTitle: { $regex: searchKey, $options: 'i' } },
      { typeOfToolbox: { $regex: searchKey, $options: 'i' } },
      { notes: { $regex: searchKey, $options: 'i' } },
    ];
  }

  const ownerIds = new Set<string>();

  if (requesterRole === UserRole.STANDALONE_USER && requesterId) {
    ownerIds.add(String(requesterId));
  }

  if (requesterRole === UserRole.TRANSPORT_MANAGER && requesterId) {
    ownerIds.add(String(requesterId));

    if (standAloneId) {
      ownerIds.add(String(standAloneId));
    }
  }

  if (ownerIds.size > 0) {
    const ownerObjectIds = Array.from(ownerIds).map((id) => new mongoose.Types.ObjectId(id));

    const accessibleDrivers = await Driver.find({
      $or: [{ standAloneId: { $in: ownerObjectIds } }, { createdBy: { $in: ownerObjectIds } }],
    })
      .select('_id')
      .lean();

    const accessibleDriverIds = accessibleDrivers.map((driver) => driver._id);

    matchStage.driverId = { $in: accessibleDriverIds };
  }

  const skipItems = (pageNo - 1) * showPerPage;

  const result = await TrainingToolboxModel.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'deliveredBy',
        foreignField: '_id',
        as: 'deliveredByUser',
      },
    },
    { $unwind: { path: '$deliveredByUser', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        deliveredBy: {
          $cond: [
            { $ifNull: ['$deliveredByUser', false] },
            {
              $concat: ['$deliveredByUser.fullName', ' (', '$deliveredByUser.role', ')'],
            },
            null,
          ],
        },
      },
    },
    {
      $project: {
        deliveredByUser: 0,
      },
    },
    {
      $facet: {
        data: [{ $skip: skipItems }, { $limit: showPerPage }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  const trainingToolboxs = result[0].data;
  const totalData = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { trainingToolboxs, totalData, totalPages };
};

export const trainingToolboxServices = {
  createTrainingToolbox,
  updateTrainingToolbox,
  deleteTrainingToolbox,
  getTrainingToolboxById,
  getManyTrainingToolbox,
};

