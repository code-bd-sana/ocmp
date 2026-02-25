import mongoose from 'mongoose';
import { TrainingRegister, ITrainingRegister } from '../../models';
import { SearchRecordsQueryInput, UpdateRecordStatusInput } from './training-records.validation';

/**
 * Service: Get grouped training records (report).
 *
 * Groups TrainingRegister entries by unique (participantId, trainingId, trainingInterval).
 * Each group contains all matching entries with their trainingDate + status.
 *
 * Supports:
 *   - Access control via $or on createdBy / standAloneId
 *   - Pagination
 *   - Search by participant name or training name
 *   - Optional status filter (show groups that contain at least one entry with that status)
 */
const getTrainingRecords = async (
  query: SearchRecordsQueryInput
): Promise<{ trainingRecords: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId, status } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  // ── 1. Access control ────────────────────────────────────────────
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    });
  }

  // ── 2. Lookup participant ────────────────────────────────────────
  basePipeline.push(
    {
      $lookup: {
        from: 'participants',
        localField: 'participantId',
        foreignField: '_id',
        as: 'participant',
        pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
      },
    },
    { $unwind: { path: '$participant', preserveNullAndEmptyArrays: true } }
  );

  // ── 3. Lookup training ──────────────────────────────────────────
  basePipeline.push(
    {
      $lookup: {
        from: 'trainingsheets',
        localField: 'trainingId',
        foreignField: '_id',
        as: 'training',
        pipeline: [{ $project: { trainingName: 1 } }],
      },
    },
    { $unwind: { path: '$training', preserveNullAndEmptyArrays: true } }
  );

  // ── 4. Search filter on participant name or training name ───────
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { 'participant.firstName': { $regex: searchKey, $options: 'i' } },
          { 'participant.lastName': { $regex: searchKey, $options: 'i' } },
          { 'training.trainingName': { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  // ── 5. Group by unique (participantId, trainingId, trainingInterval) ──
  basePipeline.push({
    $group: {
      _id: {
        participantId: '$participantId',
        trainingId: '$trainingId',
        trainingInterval: '$trainingInterval',
      },
      participantName: {
        $first: {
          $concat: [
            { $ifNull: ['$participant.firstName', ''] },
            ' ',
            { $ifNull: ['$participant.lastName', ''] },
          ],
        },
      },
      trainingName: { $first: '$training.trainingName' },
      records: {
        $push: {
          _id: '$_id',
          trainingDate: '$trainingDate',
          status: '$status',
          createdAt: '$createdAt',
        },
      },
      // Track all statuses in this group (for filtering)
      statuses: { $addToSet: '$status' },
    },
  });

  // ── 6. Optional status filter (group must contain at least one entry with that status) ──
  if (status) {
    basePipeline.push({
      $match: { statuses: status },
    });
  }

  // ── 7. Reshape output ───────────────────────────────────────────
  basePipeline.push({
    $project: {
      _id: 0,
      participantId: '$_id.participantId',
      trainingId: '$_id.trainingId',
      trainingInterval: '$_id.trainingInterval',
      participantName: 1,
      trainingName: 1,
      records: 1,
    },
  });

  // ── 8. Sort by participant name ─────────────────────────────────
  basePipeline.push({ $sort: { participantName: 1 as const } });

  // ── 9. Facet for pagination ─────────────────────────────────────
  const [result] = await TrainingRegister.aggregate([
    ...basePipeline,
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $skip: (pageNo - 1) * showPerPage },
          { $limit: showPerPage },
        ],
      },
    },
  ]);

  const totalData = result.metadata[0]?.total ?? 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { trainingRecords: result.data, totalData, totalPages };
};

/**
 * Service: Update the status of a single training register entry.
 * Uses $or access control on createdBy / standAloneId.
 */
const updateRecordStatus = async (
  registerId: string,
  data: UpdateRecordStatusInput,
  accessId: string
): Promise<ITrainingRegister> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const updated = await TrainingRegister.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(registerId),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    },
    { $set: { status: data.status } },
    { returnDocument: 'after' }
  );

  if (!updated) {
    throw new Error('Training register entry not found or access denied');
  }

  return updated;
};

export const trainingRecordsServices = {
  getTrainingRecords,
  updateRecordStatus,
};