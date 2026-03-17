import mongoose from 'mongoose';
import {
  IWheelRetorquePolicyMonitoring,
  Vehicle,
  WheelRetorquePolicyMonitoring,
} from '../../models';
import {
  CreateWheelRetorquePolicyMonitoringAsManagerInput,
  CreateWheelRetorquePolicyMonitoringAsStandAloneInput,
  SearchWheelRetorquePolicyMonitoringsQueryInput,
  UpdateWheelRetorquePolicyMonitoringInput,
} from './wheel-retorque-policy.validation';

const buildAccessFilter = (accessId: string): Record<string, unknown> => {
  const candidates: Array<string | mongoose.Types.ObjectId> = [accessId];

  if (mongoose.Types.ObjectId.isValid(accessId)) {
    candidates.unshift(new mongoose.Types.ObjectId(accessId));
  }

  return {
    $or: [{ createdBy: { $in: candidates } }, { standAloneId: { $in: candidates } }],
  };
};

const verifyVehicleUnderStandalone = async (vehicleId: string, accessId: string): Promise<void> => {
  const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);
  const objectId = new mongoose.Types.ObjectId(accessId);

  const vehicle = await Vehicle.exists({
    _id: vehicleObjectId,
    $or: [{ standAloneId: objectId }, { createdBy: objectId }],
  });

  if (!vehicle) throw new Error('Vehicle not found or does not belong to this user');
};

const createWheelRetorquePolicyMonitoringAsManager = async (
  data: CreateWheelRetorquePolicyMonitoringAsManagerInput & { createdBy: mongoose.Types.ObjectId }
): Promise<IWheelRetorquePolicyMonitoring> => {
  await verifyVehicleUnderStandalone(data.vehicleId, data.standAloneId);

  const doc: Record<string, unknown> = {
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    standAloneId: new mongoose.Types.ObjectId(data.standAloneId),
    createdBy: data.createdBy,
  };
  if (data.dateChanged !== undefined) doc.dateChanged = new Date(data.dateChanged);
  if (data.tyreSize !== undefined) doc.tyreSize = data.tyreSize;
  if (data.tyreLocation !== undefined) doc.tyreLocation = data.tyreLocation;
  if (data.reTorqueDue !== undefined) doc.reTorqueDue = new Date(data.reTorqueDue);
  if (data.reTorqueCompleted !== undefined)
    doc.reTorqueCompleted = new Date(data.reTorqueCompleted);
  if (data.technician !== undefined) doc.technician = data.technician;

  const newDoc = new WheelRetorquePolicyMonitoring(doc);
  return await newDoc.save();
};

const createWheelRetorquePolicyMonitoringAsStandAlone = async (
  data: CreateWheelRetorquePolicyMonitoringAsStandAloneInput & {
    createdBy: mongoose.Types.ObjectId;
  }
): Promise<IWheelRetorquePolicyMonitoring> => {
  await verifyVehicleUnderStandalone(data.vehicleId, data.createdBy.toString());

  const doc: Record<string, unknown> = {
    vehicleId: new mongoose.Types.ObjectId(data.vehicleId),
    createdBy: data.createdBy,
  };
  if (data.dateChanged !== undefined) doc.dateChanged = new Date(data.dateChanged);
  if (data.tyreSize !== undefined) doc.tyreSize = data.tyreSize;
  if (data.tyreLocation !== undefined) doc.tyreLocation = data.tyreLocation;
  if (data.reTorqueDue !== undefined) doc.reTorqueDue = new Date(data.reTorqueDue);
  if (data.reTorqueCompleted !== undefined)
    doc.reTorqueCompleted = new Date(data.reTorqueCompleted);
  if (data.technician !== undefined) doc.technician = data.technician;

  const newDoc = new WheelRetorquePolicyMonitoring(doc);
  return await newDoc.save();
};

const getAllWheelRetorquePolicyMonitorings = async (
  query: SearchWheelRetorquePolicyMonitoringsQueryInput
): Promise<{ wheelRetorquePolicyMonitorings: any[]; totalData: number; totalPages: number }> => {
  const showPerPage = Number(query.showPerPage) || 10;
  const pageNo = Number(query.pageNo) || 1;
  const searchKey = query.searchKey;
  const { standAloneId } = query;

  const basePipeline: mongoose.PipelineStage[] = [];

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
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: { path: '$vehicle', preserveNullAndEmptyArrays: true } }
  );

  if (searchKey) {
    basePipeline.push({
      $match: {
        $or: [
          { 'vehicle.vehicleRegId': { $regex: searchKey, $options: 'i' } },
          { tyreSize: { $regex: searchKey, $options: 'i' } },
          { tyreLocation: { $regex: searchKey, $options: 'i' } },
          { technician: { $regex: searchKey, $options: 'i' } },
        ],
      },
    });
  }

  const [result] = await WheelRetorquePolicyMonitoring.aggregate([
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

  return { wheelRetorquePolicyMonitorings: result.data, totalData, totalPages };
};

const getWheelRetorquePolicyMonitoringById = async (
  wheelRetorquePolicyMonitoringId: string,
  accessId?: string
): Promise<IWheelRetorquePolicyMonitoring> => {
  const filter: Record<string, unknown> = {
    _id: new mongoose.Types.ObjectId(wheelRetorquePolicyMonitoringId),
  };

  if (accessId) {
    Object.assign(filter, buildAccessFilter(accessId));
  }

  const doc = await WheelRetorquePolicyMonitoring.findOne(filter);
  if (!doc) throw new Error('Wheel re-torque policy monitoring not found or access denied');
  return doc;
};

const updateWheelRetorquePolicyMonitoring = async (
  wheelRetorquePolicyMonitoringId: string,
  data: UpdateWheelRetorquePolicyMonitoringInput,
  accessId: string
): Promise<IWheelRetorquePolicyMonitoring> => {
  if (data.vehicleId) {
    await verifyVehicleUnderStandalone(data.vehicleId, accessId);
  }

  const updateFields: Record<string, unknown> = {};
  if (data.vehicleId !== undefined)
    updateFields.vehicleId = new mongoose.Types.ObjectId(data.vehicleId);
  if (data.dateChanged !== undefined) updateFields.dateChanged = new Date(data.dateChanged);
  if (data.tyreSize !== undefined) updateFields.tyreSize = data.tyreSize;
  if (data.tyreLocation !== undefined) updateFields.tyreLocation = data.tyreLocation;
  if (data.reTorqueDue !== undefined) updateFields.reTorqueDue = new Date(data.reTorqueDue);
  if (data.reTorqueCompleted !== undefined)
    updateFields.reTorqueCompleted = new Date(data.reTorqueCompleted);
  if (data.technician !== undefined) updateFields.technician = data.technician;

  const updated = await WheelRetorquePolicyMonitoring.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(wheelRetorquePolicyMonitoringId),
      ...buildAccessFilter(accessId),
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!updated) throw new Error('Wheel re-torque policy monitoring not found or access denied');
  return updated;
};

const deleteWheelRetorquePolicyMonitoring = async (
  wheelRetorquePolicyMonitoringId: string,
  accessId: string
): Promise<void> => {
  const deleted = await WheelRetorquePolicyMonitoring.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(wheelRetorquePolicyMonitoringId),
    ...buildAccessFilter(accessId),
  });

  if (!deleted) throw new Error('Wheel re-torque policy monitoring not found or access denied');
};

export const wheelRetorquePolicyServices = {
  createWheelRetorquePolicyMonitoringAsManager,
  createWheelRetorquePolicyMonitoringAsStandAlone,
  getAllWheelRetorquePolicyMonitorings,
  getWheelRetorquePolicyMonitoringById,
  updateWheelRetorquePolicyMonitoring,
  deleteWheelRetorquePolicyMonitoring,
};
