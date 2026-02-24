import mongoose from 'mongoose';
import { TrainingSheet, ITrainingSheet } from '../../models';
import {
  CreateTrainingAsManagerInput,
  CreateTrainingAsStandAloneInput,
  UpdateTrainingInput,
  SearchTrainingsQueryInput,
} from './training.validation';

/**
 * Helper: Parse a string of interval days separated by comma, space, backslash, or newline
 * into a deduplicated, sorted array of positive integers.
 *
 * @param {string} raw - The raw input string (e.g. "30, 60\\90\n120").
 * @returns {number[]} - Parsed array of positive integers.
 */
const parseIntervalDays = (raw: string): number[] => {
  // Split by comma, space, backslash, or newline (any combination)
  const parts = raw.split(/[,\s\\/\\\\]+/).filter(Boolean);
  const days: number[] = [];

  for (const part of parts) {
    const num = Number(part.trim());
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      throw new Error(`Invalid interval day value: "${part}". Must be a positive integer.`);
    }
    days.push(num);
  }

  if (days.length === 0) {
    throw new Error('At least one interval day must be provided');
  }

  // Deduplicate and sort ascending
  return [...new Set(days)].sort((a, b) => a - b);
};

// ═══════════════════════════════════════════════════════════════
// TRAINING SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Create a new training as a Transport Manager.
 * createdBy = managerId, standAloneId = client's userId.
 */
const createTrainingAsManager = async (
  data: CreateTrainingAsManagerInput & { createdBy: mongoose.Types.ObjectId; standAloneId: mongoose.Types.ObjectId }
): Promise<ITrainingSheet> => {
  const parsedDays = parseIntervalDays(data.intervalDays);

  return TrainingSheet.create({
    trainingName: data.trainingName,
    intervalDays: parsedDays,
    createdBy: data.createdBy,
    standAloneId: data.standAloneId,
  });
};

/**
 * Service: Create a new training as a Standalone User.
 * createdBy = userId (self).
 */
const createTrainingAsStandAlone = async (
  data: CreateTrainingAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<ITrainingSheet> => {
  const parsedDays = parseIntervalDays(data.intervalDays);

  return TrainingSheet.create({
    trainingName: data.trainingName,
    intervalDays: parsedDays,
    createdBy: data.createdBy,
  });
};

/**
 * Service: Get all trainings (paginated + searchable).
 * Uses $or on createdBy/standAloneId so both TM-created and standalone-created docs are returned.
 * Returns only the FIRST interval day for each training (summary view).
 */
const getAllTrainings = async (
  query: SearchTrainingsQueryInput
): Promise<{ trainings: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const filter: any = {};

  // Access control: find docs where the target ID matches either createdBy or standAloneId
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    filter.$or = [{ standAloneId: objectId }, { createdBy: objectId }];
  }

  // Search filter on trainingName
  if (searchKey) {
    filter.trainingName = { $regex: searchKey, $options: 'i' };
  }

  const totalData = await TrainingSheet.countDocuments(filter);
  const totalPages = Math.ceil(totalData / showPerPage);

  const trainings = await TrainingSheet.find(filter)
    .select('trainingName intervalDays createdAt updatedAt')
    .skip((pageNo - 1) * showPerPage)
    .limit(showPerPage)
    .lean();

  // Return only the first interval day for each training (summary view)
  const data = trainings.map((t: any) => ({
    _id: t._id,
    trainingName: t.trainingName,
    firstIntervalDay: t.intervalDays[0] ?? null,
    totalIntervals: t.intervalDays.length,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return { trainings: data, totalData, totalPages };
};

/**
 * Service: Get a single training with ALL interval days.
 * Uses $or to check both createdBy and standAloneId ownership.
 */
const getTrainingById = async (
  trainingId: string,
  accessId?: string
): Promise<ITrainingSheet> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(trainingId) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [
      { standAloneId: objectId },
      { createdBy: objectId },
    ];
  }

  const training = await TrainingSheet.findOne(filter).lean();

  if (!training) {
    throw new Error('Training not found or you do not have access');
  }

  return training as ITrainingSheet;
};

/**
 * Service: Update a training's details.
 * If intervalDays is provided as a string, it's parsed into a number array.
 * Uses $or on createdBy/standAloneId for access control.
 */
const updateTraining = async (
  trainingId: string,
  data: UpdateTrainingInput,
  accessId: string
): Promise<ITrainingSheet> => {
  const updateFields: Record<string, any> = {};

  if (data.trainingName) {
    updateFields.trainingName = data.trainingName;
  }

  if (data.intervalDays) {
    updateFields.intervalDays = parseIntervalDays(data.intervalDays);
  }

  const updated = await TrainingSheet.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(trainingId),
      $or: [
        { createdBy: new mongoose.Types.ObjectId(accessId) },
        { standAloneId: new mongoose.Types.ObjectId(accessId) },
      ],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  ).lean();

  if (!updated) {
    throw new Error('Training not found or you do not have access');
  }

  return updated as ITrainingSheet;
};

/**
 * Service: Delete a specific training.
 * Uses $or on createdBy/standAloneId for access control.
 */
const deleteTraining = async (
  trainingId: string,
  accessId: string
): Promise<{ deletedCount: number }> => {
  const result = await TrainingSheet.deleteOne({
    _id: new mongoose.Types.ObjectId(trainingId),
    $or: [
      { createdBy: new mongoose.Types.ObjectId(accessId) },
      { standAloneId: new mongoose.Types.ObjectId(accessId) },
    ],
  });

  if (result.deletedCount === 0) {
    throw new Error('Training not found or you do not have access');
  }

  return { deletedCount: result.deletedCount };
};

// Export all service functions as a namespace
export const trainingServices = {
  createTrainingAsManager,
  createTrainingAsStandAlone,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};