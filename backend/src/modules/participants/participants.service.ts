import mongoose from 'mongoose';
import { Participant, IParticipant, ParticipantRole, IParticipantRole } from '../../models';
import {
  CreateParticipantAsManagerInput,
  CreateParticipantAsStandAloneInput,
  UpdateParticipantInput,
  CreateRoleAsManagerInput,
  CreateRoleAsStandAloneInput,
  UpdateRoleInput,
  SearchParticipantsQueryInput,
} from './participants.validation';
import { SearchQueryInput } from '../../handlers/common-zod-validator';

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all participants.
 * TM: filters by createdBy (managerId); Standalone: filters by $or [standAloneId, createdBy].
 * Supports pagination (showPerPage, pageNo) and search (searchKey) on firstName, lastName.
 * Populates the role field to return roleName.
 */
const getAllParticipants = async (
  query: SearchParticipantsQueryInput
): Promise<{ participants: IParticipant[]; totalData: number; totalPages: number }> => {
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

  basePipeline.push(
    {
      $lookup: {
        from: 'participantroles',
        localField: 'role',
        foreignField: '_id',
        as: 'role',
        pipeline: [{ $project: { roleName: 1 } }],
      },
    },
    { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } }
  );

  // Search filter on participant fields
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { firstName: { $regex: searchKey, $options: 'i' } },
          { lastName: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await Participant.aggregate([
    ...basePipeline,
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: (pageNo - 1) * showPerPage }, { $limit: showPerPage }],
      },
    },
  ]);

  const totalData = result.metadata[0]?.total ?? 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { participants: result.data, totalData, totalPages };
};

/**
 * Service: Get a single participant by ID.
 * Uses $or to check both createdBy and standAloneId ownership.
 */
const getParticipantById = async (
  participantId: string,
  standAloneId?: string
): Promise<IParticipant> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(participantId) };
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    filter.$or = [
      { standAloneId: objectId },
      { createdBy: objectId },
    ];
  }

  const participant = await Participant.findOne(filter)
    .populate('role', 'roleName')
    .lean();

  if (!participant) {
    throw new Error('Participant not found or you do not have access');
  }

  return participant as IParticipant;
};

/**
 * Service: Create a new participant as a Transport Manager.
 * createdBy = managerId, standAloneId = client's userId.
 */
const createParticipantAsManager = async (
  data: CreateParticipantAsManagerInput & { createdBy: mongoose.Types.ObjectId; standAloneId: mongoose.Types.ObjectId }
): Promise<IParticipant> => {
  // Verify the role exists and belongs to this standalone/client scope
  const roleExists = await ParticipantRole.findOne({
    _id: new mongoose.Types.ObjectId(data.role),
    $or: [
      { createdBy: data.createdBy },
      { standAloneId: data.standAloneId },
      { createdBy: data.standAloneId },
    ],
  }).lean();

  if (!roleExists) {
    throw new Error('Role not found or you do not have access to this role');
  }

  return Participant.create({
    firstName: data.firstName,
    lastName: data.lastName,
    role: new mongoose.Types.ObjectId(data.role),
    employmentStatus: data.employmentStatus,
    createdBy: data.createdBy,
    standAloneId: data.standAloneId,
  });
};

/**
 * Service: Create a new participant as a Standalone User.
 * createdBy = userId (self).
 */
const createParticipantAsStandAlone = async (
  data: CreateParticipantAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IParticipant> => {
  // Verify the role exists and belongs to this standalone user
  const roleExists = await ParticipantRole.findOne({
    _id: new mongoose.Types.ObjectId(data.role),
    $or: [
      { createdBy: data.createdBy },
      { standAloneId: data.createdBy },
    ],
  }).lean();

  if (!roleExists) {
    throw new Error('Role not found or you do not have access to this role');
  }

  return Participant.create({
    firstName: data.firstName,
    lastName: data.lastName,
    role: new mongoose.Types.ObjectId(data.role),
    employmentStatus: data.employmentStatus,
    createdBy: data.createdBy,
  });
};

/**
 * Service: Update a participant's details.
 * Uses $or on createdBy/standAloneId for access control.
 */
const updateParticipant = async (
  participantId: string,
  data: UpdateParticipantInput,
  userId: string
): Promise<IParticipant> => {
  const updateFields: Record<string, any> = {};

  if (data.firstName !== undefined) updateFields.firstName = data.firstName;
  if (data.lastName !== undefined) updateFields.lastName = data.lastName;
  if (data.employmentStatus !== undefined) updateFields.employmentStatus = data.employmentStatus;

  if (data.role !== undefined) {
    // Verify the new role exists and the user has access
    const roleExists = await ParticipantRole.findOne({
      _id: new mongoose.Types.ObjectId(data.role),
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { standAloneId: new mongoose.Types.ObjectId(userId) },
      ],
    }).lean();

    if (!roleExists) {
      throw new Error('Role not found or you do not have access to this role');
    }

    updateFields.role = new mongoose.Types.ObjectId(data.role);
  }

  const updated = await Participant.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(participantId),
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { standAloneId: new mongoose.Types.ObjectId(userId) },
      ],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  )
    .populate('role', 'roleName')
    .lean();

  if (!updated) {
    throw new Error('Participant not found or you do not have access');
  }

  return updated as IParticipant;
};

/**
 * Service: Delete a participant.
 * Uses $or on createdBy/standAloneId for access control.
 */
const deleteParticipant = async (
  participantId: string,
  userId: string
): Promise<{ deletedCount: number }> => {
  const result = await Participant.deleteOne({
    _id: new mongoose.Types.ObjectId(participantId),
    $or: [
      { createdBy: new mongoose.Types.ObjectId(userId) },
      { standAloneId: new mongoose.Types.ObjectId(userId) },
    ],
  });

  if (result.deletedCount === 0) {
    throw new Error('Participant not found or you do not have access');
  }

  return { deletedCount: result.deletedCount };
};

// ═══════════════════════════════════════════════════════════════
// PARTICIPANT ROLE SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all roles.
 * TM: filters by createdBy; Standalone: filters by $or [standAloneId, createdBy].
 * Supports pagination (showPerPage, pageNo).
 */
const getAllRoles = async (
  query: SearchParticipantsQueryInput
): Promise<{ roles: IParticipantRole[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const { standAloneId } = query;

  // Access control: find docs where the target ID matches either createdBy or standAloneId
  let filter: any = {};
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    filter = {
      $or: [{ standAloneId: objectId }, { createdBy: objectId }],
    };
  }

  const totalData = await ParticipantRole.countDocuments(filter);
  const totalPages = Math.ceil(totalData / showPerPage);

  const data = await ParticipantRole.find(filter)
    .skip((pageNo - 1) * showPerPage)
    .limit(showPerPage)
    .lean();

  return { roles: data as IParticipantRole[], totalData, totalPages };
};

/**
 * Service: Create a new participant role as a Transport Manager.
 * Duplicate check: case-insensitive roleName scoped to standAloneId + createdBy.
 */
const createRoleAsManager = async (
  data: CreateRoleAsManagerInput & { createdBy: mongoose.Types.ObjectId; standAloneId: mongoose.Types.ObjectId }
): Promise<IParticipantRole> => {
  const existing = await ParticipantRole.findOne({
    createdBy: data.createdBy,
    standAloneId: data.standAloneId,
    roleName: { $regex: new RegExp(`^${data.roleName}$`, 'i') },
  }).lean();

  if (existing) {
    throw new Error(`Role "${data.roleName}" already exists`);
  }

  return ParticipantRole.create({
    roleName: data.roleName,
    createdBy: data.createdBy,
    standAloneId: data.standAloneId,
  });
};

/**
 * Service: Create a new participant role as a Standalone User.
 * Duplicate check: case-insensitive roleName scoped to createdBy.
 */
const createRoleAsStandAlone = async (
  data: CreateRoleAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IParticipantRole> => {
  const existing = await ParticipantRole.findOne({
    createdBy: data.createdBy,
    roleName: { $regex: new RegExp(`^${data.roleName}$`, 'i') },
  }).lean();

  if (existing) {
    throw new Error(`Role "${data.roleName}" already exists`);
  }

  return ParticipantRole.create({
    roleName: data.roleName,
    createdBy: data.createdBy,
  });
};

/**
 * Service: Update a participant role.
 * Duplicate check: case-insensitive roleName scoped to user (excluding self).
 * Uses $or on createdBy/standAloneId for access control.
 */
const updateRole = async (
  roleId: string,
  data: UpdateRoleInput,
  userId: string
): Promise<IParticipantRole> => {
  // Check for duplicate under the same user scope
  const existing = await ParticipantRole.findOne({
    _id: { $ne: new mongoose.Types.ObjectId(roleId) },
    $or: [
      { createdBy: new mongoose.Types.ObjectId(userId) },
      { standAloneId: new mongoose.Types.ObjectId(userId) },
    ],
    roleName: { $regex: new RegExp(`^${data.roleName}$`, 'i') },
  }).lean();

  if (existing) {
    throw new Error(`Role "${data.roleName}" already exists`);
  }

  const updated = await ParticipantRole.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(roleId),
      $or: [
        { createdBy: new mongoose.Types.ObjectId(userId) },
        { standAloneId: new mongoose.Types.ObjectId(userId) },
      ],
    },
    { $set: { roleName: data.roleName } },
    { returnDocument: 'after' }
  ).lean();

  if (!updated) {
    throw new Error('Role not found or you do not have access');
  }

  return updated as IParticipantRole;
};

/**
 * Service: Delete a participant role.
 * Checks if any participants are using this role before deleting.
 * Uses $or on createdBy/standAloneId for access control.
 */
const deleteRole = async (
  roleId: string,
  userId: string
): Promise<{ deletedCount: number }> => {
  // Check if any participants use this role under the user's scope
  const usageCount = await Participant.countDocuments({
    role: new mongoose.Types.ObjectId(roleId),
    $or: [
      { createdBy: new mongoose.Types.ObjectId(userId) },
      { standAloneId: new mongoose.Types.ObjectId(userId) },
    ],
  });

  if (usageCount > 0) {
    throw new Error(
      `Cannot delete role: ${usageCount} participant(s) are currently assigned to this role`
    );
  }

  const result = await ParticipantRole.deleteOne({
    _id: new mongoose.Types.ObjectId(roleId),
    $or: [
      { createdBy: new mongoose.Types.ObjectId(userId) },
      { standAloneId: new mongoose.Types.ObjectId(userId) },
    ],
  });

  if (result.deletedCount === 0) {
    throw new Error('Role not found or you do not have access');
  }

  return { deletedCount: result.deletedCount };
};

// Export all service functions
export const participantsServices = {
  // Participant
  getAllParticipants,
  getParticipantById,
  createParticipantAsManager,
  createParticipantAsStandAlone,
  updateParticipant,
  deleteParticipant,
  // Role
  getAllRoles,
  createRoleAsManager,
  createRoleAsStandAlone,
  updateRole,
  deleteRole,
};