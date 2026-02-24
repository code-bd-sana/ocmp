import mongoose from 'mongoose';
import {
  TrainingRegister,
  ITrainingRegister,
  Participant,
  TrainingSheet,
} from '../../models';
import {
  CreateRegisterAsManagerInput,
  CreateRegisterAsStandAloneInput,
  UpdateRegisterInput,
  SearchRegistersQueryInput,
} from './training-register.validation';

// ═══════════════════════════════════════════════════════════════
// HELPER: Validate participant + training + interval ownership
// ═══════════════════════════════════════════════════════════════

/**
 * Validates that the participant and training belong to the target standalone user,
 * and that the trainingInterval is a valid interval in the training's intervalDays array.
 *
 * @param accessId - The standalone user's ObjectId (for both TM and standalone flows)
 * @param participantId - The participant document ID
 * @param trainingId - The training document ID
 * @param trainingInterval - The interval day value to validate
 */
const validateOwnershipAndInterval = async (
  accessId: mongoose.Types.ObjectId,
  participantId: string,
  trainingId: string,
  trainingInterval: number
) => {
  // 1. Verify participant belongs to the standalone user (check both createdBy and standAloneId)
  const participant = await Participant.findOne({
    _id: new mongoose.Types.ObjectId(participantId),
    $or: [{ createdBy: accessId }, { standAloneId: accessId }],
  }).lean();

  if (!participant) {
    throw new Error('Participant not found or you do not have access to this participant');
  }

  // 2. Verify training belongs to the standalone user (check both createdBy and standAloneId)
  const training = await TrainingSheet.findOne({
    _id: new mongoose.Types.ObjectId(trainingId),
    $or: [{ createdBy: accessId }, { standAloneId: accessId }],
  }).lean();

  if (!training) {
    throw new Error('Training not found or you do not have access to this training');
  }

  // 3. Verify trainingInterval is actually in the training's intervalDays array
  if (!training.intervalDays.includes(trainingInterval)) {
    throw new Error(
      `Invalid training interval: ${trainingInterval}. Valid intervals for this training are: [${training.intervalDays.join(', ')}]`
    );
  }
};

// ═══════════════════════════════════════════════════════════════
// CREATE SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Create a training register entry as a Transport Manager.
 * createdBy = managerId, standAloneId = client's userId.
 * Validates participant + training belong to the standalone user,
 * and trainingInterval is valid.
 */
const createRegisterAsManager = async (
  data: CreateRegisterAsManagerInput & { createdBy: mongoose.Types.ObjectId; standAloneId: mongoose.Types.ObjectId }
): Promise<ITrainingRegister> => {
  // Validate ownership using the standalone client's ID
  await validateOwnershipAndInterval(
    data.standAloneId,
    data.participantId,
    data.trainingId,
    data.trainingInterval
  );

  return TrainingRegister.create({
    participantId: new mongoose.Types.ObjectId(data.participantId),
    trainingId: new mongoose.Types.ObjectId(data.trainingId),
    trainingInterval: data.trainingInterval,
    trainingDate: new Date(data.trainingDate),
    createdBy: data.createdBy,
    standAloneId: data.standAloneId,
  });
};

/**
 * Service: Create a training register entry as a Standalone User.
 * createdBy = userId (self).
 * Validates participant + training belong to the standalone user,
 * and trainingInterval is valid.
 */
const createRegisterAsStandAlone = async (
  data: CreateRegisterAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<ITrainingRegister> => {
  // Validate ownership using the standalone user's own ID
  await validateOwnershipAndInterval(
    data.createdBy,
    data.participantId,
    data.trainingId,
    data.trainingInterval
  );

  return TrainingRegister.create({
    participantId: new mongoose.Types.ObjectId(data.participantId),
    trainingId: new mongoose.Types.ObjectId(data.trainingId),
    trainingInterval: data.trainingInterval,
    trainingDate: new Date(data.trainingDate),
    createdBy: data.createdBy,
  });
};

// ═══════════════════════════════════════════════════════════════
// READ SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all training register entries (paginated + searchable).
 * Uses $or on createdBy/standAloneId so both TM-created and standalone-created entries are returned.
 * Populates participant (firstName, lastName) and training (trainingName).
 */
const getAllRegisters = async (
  query: SearchRegistersQueryInput
): Promise<{ registers: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  // Access control: find docs where the target ID matches either createdBy or standAloneId
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    });
  }

  // Populate participant
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

  // Populate training
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

  // Search filter on participant name or training name
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

  const [result] = await TrainingRegister.aggregate([
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

  const totalData = result.metadata[0]?.total ?? 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { registers: result.data, totalData, totalPages };
};

/**
 * Service: Get a single training register entry by ID.
 * Uses $or to check both createdBy and standAloneId ownership.
 * Populates participant and training.
 */
const getRegisterById = async (
  registerId: string,
  accessId?: string
): Promise<ITrainingRegister> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(registerId) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [
      { standAloneId: objectId },
      { createdBy: objectId },
    ];
  }

  const register = await TrainingRegister.findOne(filter)
    .populate('participantId', 'firstName lastName')
    .populate('trainingId', 'trainingName intervalDays')
    .lean();

  if (!register) {
    throw new Error('Training register entry not found or you do not have access');
  }

  return register as ITrainingRegister;
};

// ═══════════════════════════════════════════════════════════════
// UPDATE SERVICE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Update a training register entry.
 * If participantId or trainingId or trainingInterval is changed, re-validates ownership.
 * Uses $or on createdBy/standAloneId for access control.
 */
const updateRegister = async (
  registerId: string,
  data: UpdateRegisterInput,
  accessId: string
): Promise<ITrainingRegister> => {
  const accessObjId = new mongoose.Types.ObjectId(accessId);

  // First fetch the existing register to get current values for validation
  const existing = await TrainingRegister.findOne({
    _id: new mongoose.Types.ObjectId(registerId),
    $or: [
      { createdBy: accessObjId },
      { standAloneId: accessObjId },
    ],
  }).lean();

  if (!existing) {
    throw new Error('Training register entry not found or you do not have access');
  }

  // Determine the final values (new or existing)
  const finalParticipantId = data.participantId ?? existing.participantId.toString();
  const finalTrainingId = data.trainingId ?? existing.trainingId.toString();
  const finalInterval = data.trainingInterval ?? existing.trainingInterval;

  // If any of the ownership-sensitive fields changed, re-validate
  if (data.participantId || data.trainingId || data.trainingInterval !== undefined) {
    await validateOwnershipAndInterval(
      accessObjId,
      finalParticipantId,
      finalTrainingId,
      finalInterval
    );
  }

  const updateFields: Record<string, any> = {};
  if (data.participantId !== undefined) updateFields.participantId = new mongoose.Types.ObjectId(data.participantId);
  if (data.trainingId !== undefined) updateFields.trainingId = new mongoose.Types.ObjectId(data.trainingId);
  if (data.trainingInterval !== undefined) updateFields.trainingInterval = data.trainingInterval;
  if (data.trainingDate !== undefined) updateFields.trainingDate = new Date(data.trainingDate);

  const updated = await TrainingRegister.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(registerId),
      $or: [
        { createdBy: accessObjId },
        { standAloneId: accessObjId },
      ],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
    .populate('participantId', 'firstName lastName')
    .populate('trainingId', 'trainingName intervalDays')
    .lean();

  if (!updated) {
    throw new Error('Training register entry not found or you do not have access');
  }

  return updated as ITrainingRegister;
};

// ═══════════════════════════════════════════════════════════════
// DELETE SERVICE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Delete a training register entry.
 * Uses $or on createdBy/standAloneId for access control.
 */
const deleteRegister = async (
  registerId: string,
  accessId: string
): Promise<{ deletedCount: number }> => {
  const result = await TrainingRegister.deleteOne({
    _id: new mongoose.Types.ObjectId(registerId),
    $or: [
      { createdBy: new mongoose.Types.ObjectId(accessId) },
      { standAloneId: new mongoose.Types.ObjectId(accessId) },
    ],
  });

  if (result.deletedCount === 0) {
    throw new Error('Training register entry not found or you do not have access');
  }

  return { deletedCount: result.deletedCount };
};

// Export all service functions
export const trainingRegisterServices = {
  createRegisterAsManager,
  createRegisterAsStandAlone,
  getAllRegisters,
  getRegisterById,
  updateRegister,
  deleteRegister,
};