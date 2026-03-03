import mongoose from 'mongoose';
import { WorkingTimeDirective, IWorkingTimeDirective, Vehicle, Driver } from '../../models';
import {
  CreateWorkingTimeDirectiveAsManagerInput,
  CreateWorkingTimeDirectiveAsStandAloneInput,
  UpdateWorkingTimeDirectiveInput,
  SearchWorkingTimeDirectivesQueryInput,
} from './working-time-directive.validation';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Verifies the vehicle is assigned to the driver.
 * The Vehicle schema has `driverIds: ObjectId[]` — the given driverId
 * must be present in that array.
 */
const verifyVehicleUnderDriver = async (
  driverId: string,
  vehicleId: string
): Promise<void> => {
  const driverObjectId = new mongoose.Types.ObjectId(driverId);
  const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);

  // Confirm the driver exists
  const driverExists = await Driver.exists({ _id: driverObjectId });
  if (!driverExists) throw new Error('Driver not found');

  // Confirm the vehicle exists AND the driver is assigned to it
  const vehicle = await Vehicle.exists({
    _id: vehicleObjectId,
    driverIds: driverObjectId,
  });
  if (!vehicle) throw new Error('Vehicle not found or not assigned to this driver');
};

// ═══════════════════════════════════════════════════════════════
// CREATE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Create a working time directive as a Transport Manager.
 * The TM's createdBy is set in controller; standAloneId comes from body.
 */
const createWorkingTimeDirectiveAsManager = async (
  data: CreateWorkingTimeDirectiveAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IWorkingTimeDirective> => {
  // Verify vehicle is assigned to the driver
  await verifyVehicleUnderDriver(data.driverId, data.vehicleId);

  const doc: Record<string, any> = {
    driverId: new mongoose.Types.ObjectId(data.driverId),
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    workingHours: data.workingHours,
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.restHours !== undefined) doc.restHours = data.restHours;
  if (data.complianceStatus !== undefined) doc.complianceStatus = data.complianceStatus;
  if (data.tachoReportAvailable !== undefined) doc.tachoReportAvailable = data.tachoReportAvailable;

  const newDoc = new WorkingTimeDirective(doc);
  return await newDoc.save();
};

/**
 * Service: Create a working time directive as a Standalone User.
 * No standAloneId needed; createdBy is set in controller.
 */
const createWorkingTimeDirectiveAsStandAlone = async (
  data: CreateWorkingTimeDirectiveAsStandAloneInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IWorkingTimeDirective> => {
  // Verify vehicle is assigned to the driver
  await verifyVehicleUnderDriver(data.driverId, data.vehicleId);

  const doc: Record<string, any> = {
    driverId: new mongoose.Types.ObjectId(data.driverId),
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    workingHours: data.workingHours,
    createdBy: data.createdBy,
  };
  if (data.restHours !== undefined) doc.restHours = data.restHours;
  if (data.complianceStatus !== undefined) doc.complianceStatus = data.complianceStatus;
  if (data.tachoReportAvailable !== undefined) doc.tachoReportAvailable = data.tachoReportAvailable;

  const newDoc = new WorkingTimeDirective(doc);
  return await newDoc.save();
};

// ═══════════════════════════════════════════════════════════════
// READ
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all working time directives (paginated + searchable).
 * Uses aggregation with $or access control and text search.
 */
const getAllWorkingTimeDirectives = async (
  query: SearchWorkingTimeDirectivesQueryInput
): Promise<{ workingTimeDirectives: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

  // Access control
  if (standAloneId) {
    const objectId = new mongoose.Types.ObjectId(standAloneId);
    basePipeline.push({
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    });
  }

  // Lookup driver details for search
  basePipeline.push(
    {
      $lookup: {
        from: 'drivers',
        localField: 'driverId',
        foreignField: '_id',
        as: 'driver',
      },
    },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } }
  );

  // Search filter on driver fullName, vehicle vehicleRegId, complianceStatus
  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { 'driver.fullName': { $regex: searchKey, $options: 'i' } },
          { 'vehicle.vehicleRegId': { $regex: searchKey, $options: 'i' } },
          { complianceStatus: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await WorkingTimeDirective.aggregate([
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

  return { workingTimeDirectives: result.data, totalData, totalPages };
};

/**
 * Service: Get a single working time directive by ID.
 * Uses $or access control on createdBy / standAloneId.
 */
const getWorkingTimeDirectiveById = async (
  workingTimeDirectiveId: string,
  accessId?: string
): Promise<IWorkingTimeDirective> => {
  const filter: any = { _id: new mongoose.Types.ObjectId(workingTimeDirectiveId) };

  if (accessId) {
    const objectId = new mongoose.Types.ObjectId(accessId);
    filter.$or = [{ createdBy: objectId }, { standAloneId: objectId }];
  }

  const doc = await WorkingTimeDirective.findOne(filter);
  if (!doc) throw new Error('Working time directive not found or access denied');
  return doc;
};

// ═══════════════════════════════════════════════════════════════
// UPDATE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Update a working time directive.
 * Uses $or access control on createdBy / standAloneId.
 * If driverId or vehicleId is being changed, re-verify the relationship.
 */
const updateWorkingTimeDirective = async (
  workingTimeDirectiveId: string,
  data: UpdateWorkingTimeDirectiveInput,
  accessId: string
): Promise<IWorkingTimeDirective> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  // If either driverId or vehicleId changes, we need to verify the relationship
  if (data.driverId || data.vehicleId) {
    // Fetch the existing document to fill in the unchanged side
    const existing = await WorkingTimeDirective.findOne({
      _id: new mongoose.Types.ObjectId(workingTimeDirectiveId),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    });
    if (!existing) throw new Error('Working time directive not found or access denied');

    const effectiveDriverId = data.driverId ?? existing.driverId.toString();
    const effectiveVehicleId = data.vehicleId ?? existing.vehicleId.toString();
    await verifyVehicleUnderDriver(effectiveDriverId, effectiveVehicleId);
  }

  const updateFields: Record<string, any> = {};
  if (data.driverId !== undefined) updateFields.driverId = new mongoose.Types.ObjectId(data.driverId);
  if (data.vehicleId !== undefined) updateFields.vehicleId = new mongoose.Types.ObjectId(data.vehicleId);
  if (data.workingHours !== undefined) updateFields.workingHours = data.workingHours;
  if (data.restHours !== undefined) updateFields.restHours = data.restHours;
  if (data.complianceStatus !== undefined) updateFields.complianceStatus = data.complianceStatus;
  if (data.tachoReportAvailable !== undefined) updateFields.tachoReportAvailable = data.tachoReportAvailable;

  const updated = await WorkingTimeDirective.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(workingTimeDirectiveId),
      $or: [{ createdBy: objectId }, { standAloneId: objectId }],
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!updated) throw new Error('Working time directive not found or access denied');
  return updated;
};

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Delete a working time directive.
 * Uses $or access control on createdBy / standAloneId.
 */
const deleteWorkingTimeDirective = async (
  workingTimeDirectiveId: string,
  accessId: string
): Promise<void> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const deleted = await WorkingTimeDirective.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(workingTimeDirectiveId),
    $or: [{ createdBy: objectId }, { standAloneId: objectId }],
  });

  if (!deleted) throw new Error('Working time directive not found or access denied');
};

// ═══════════════════════════════════════════════════════════════
// DRIVERS WITH VEHICLES
// ═══════════════════════════════════════════════════════════════

/**
 * Service: Get all drivers belonging to a standalone user, each
 * populated with their assigned vehicles.
 *
 * Uses the Driver collection filtered by $or access control,
 * then $lookup on vehicles where driverIds contains the driver._id.
 */
const getDriversWithVehicles = async (
  accessId: string
): Promise<any[]> => {
  const objectId = new mongoose.Types.ObjectId(accessId);

  const drivers = await Driver.aggregate([
    // Access control — same driver belongs to standalone or was created by TM for that standalone
    {
      $match: {
        $or: [{ standAloneId: objectId }, { createdBy: objectId }],
      },
    },
    // Lookup vehicles whose driverIds array contains this driver
    {
      $lookup: {
        from: 'vehicles',
        let: { dId: '$_id' },
        pipeline: [
          { $match: { $expr: { $in: ['$$dId', '$driverIds'] } } },
          { $project: { _id: 1, vehicleRegId: 1, vehicleType: 1, licensePlate: 1, status: 1 } },
        ],
        as: 'vehicles',
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return drivers;
};

export const workingTimeDirectiveServices = {
  createWorkingTimeDirectiveAsManager,
  createWorkingTimeDirectiveAsStandAlone,
  getAllWorkingTimeDirectives,
  getWorkingTimeDirectiveById,
  updateWorkingTimeDirective,
  deleteWorkingTimeDirective,
  getDriversWithVehicles,
};
