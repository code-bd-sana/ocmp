import mongoose from 'mongoose';
import { TrainingSheet, ITrainingSheet } from '../../models';
import { CreateTrainingInput, UpdateTrainingInput } from './training.validation';

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

/**
 * Service: Create a new training under the authenticated Transport Manager.
 * intervalDays is received as a string and parsed into a number array.
 *
 * @param {string} creatorId - The TM's user ID (from req.user._id).
 * @param {CreateTrainingInput} data - { trainingName, intervalDays (string) }.
 * @returns {Promise<ITrainingSheet>} - The created training document.
 */
const createTraining = async (
  creatorId: string,
  data: CreateTrainingInput
): Promise<ITrainingSheet> => {
  const parsedDays = parseIntervalDays(data.intervalDays);

  return TrainingSheet.create({
    trainingName: data.trainingName,
    intervalDays: parsedDays,
    creatorId: new mongoose.Types.ObjectId(creatorId),
  });
};

/**
 * Service: Get all trainings for a Transport Manager.
 * Returns only the FIRST interval day for each training (summary view).
 *
 * @param {string} creatorId - The TM's user ID (from req.user._id).
 * @returns {Promise<any[]>} - Array of trainings with only the first intervalDay.
 */
const getAllTrainings = async (creatorId: string): Promise<any[]> => {
  const trainings = await TrainingSheet.find({
    creatorId: new mongoose.Types.ObjectId(creatorId),
  })
    .select('trainingName intervalDays createdAt updatedAt')
    .lean();

  // Return only the first interval day for each training
  return trainings.map((t: any) => ({
    _id: t._id,
    trainingName: t.trainingName,
    firstIntervalDay: t.intervalDays[0] ?? null,
    totalIntervals: t.intervalDays.length,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
};

/**
 * Service: Get a single training with ALL interval days.
 * Only the creator (TM) can access their own training.
 *
 * @param {string} creatorId - The TM's user ID (from req.user._id).
 * @param {string} trainingId - The training document ID.
 * @returns {Promise<ITrainingSheet>} - The full training document.
 */
const getTrainingById = async (
  creatorId: string,
  trainingId: string
): Promise<ITrainingSheet> => {
  const training = await TrainingSheet.findOne({
    _id: new mongoose.Types.ObjectId(trainingId),
    creatorId: new mongoose.Types.ObjectId(creatorId),
  }).lean();

  if (!training) {
    throw new Error('Training not found or you do not have access');
  }

  return training as ITrainingSheet;
};

/**
 * Service: Update a training's details.
 * If intervalDays is provided as a string, it's parsed into a number array.
 * TODO: can't remove a interval days if they are linked to existing compliance records — consider adding a warning or preventing deletion in that case.
 *
 * @param {string} creatorId - The TM's user ID (from req.user._id).
 * @param {string} trainingId - The training document ID.
 * @param {UpdateTrainingInput} data - Partial update fields.
 * @returns {Promise<ITrainingSheet>} - The updated training document.
 */
const updateTraining = async (
  creatorId: string,
  trainingId: string,
  data: UpdateTrainingInput
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
      creatorId: new mongoose.Types.ObjectId(creatorId),
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
 * Only the creator (TM) can delete their own training.
 * TODO: if any compliance records are linked to this training, consider preventing deletion or implementing a soft delete instead.
 *
 * @param {string} creatorId - The TM's user ID (from req.user._id).
 * @param {string} trainingId - The training document ID.
 * @returns {Promise<{ deletedCount: number }>} - Deletion result.
 */
const deleteTraining = async (
  creatorId: string,
  trainingId: string
): Promise<{ deletedCount: number }> => {
  const result = await TrainingSheet.deleteOne({
    _id: new mongoose.Types.ObjectId(trainingId),
    creatorId: new mongoose.Types.ObjectId(creatorId),
  });

  if (result.deletedCount === 0) {
    throw new Error('Training not found or you do not have access');
  }

  return { deletedCount: result.deletedCount };
};

// Export all service functions as a namespace
export const trainingServices = {
  createTraining,
  getAllTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};