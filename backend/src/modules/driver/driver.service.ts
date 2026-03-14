// Import the model
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { DriverTachograph, FuelUsage, Vehicle } from '../../models';
import DocumentModel from '../../models/document.schema';
import DriverModel, { IDriver } from '../../models/vehicle-transport/driver.schema';
import { deleteObject, uploadBuffer } from '../../utils/aws/s3';
import {
  CreateDriverAsStandAloneInput,
  CreateDriverAsTransportManagerInput,
  SearchDriverQueryInput,
  UpdateDriverInput,
} from './driver.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service function to create a new driver as a Transport Manager.
 *
 * @param {CreateDriverAsTransportManagerInput} data - The data to create a new driver.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 */
const createDriverAsTransportManager = async (
  data: CreateDriverAsTransportManagerInput
): Promise<Partial<IDriver>> => {
  // Check for duplicate driver by licenseNumber or niNumber
  const existingDriver = await DriverModel.findOne({
    $or: [
      { licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') } },
      { niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } },
    ],
  });

  if (existingDriver) {
    throw new Error('Driver already exists');
  }

  const newDriver = new DriverModel(data);
  const savedDriver = await newDriver.save();
  return savedDriver;
};

/**
 * Service function to create a new driver as a Stand-alone User.
 *
 * @param {CreateDriverAsStandAloneInput} data - The data to create a new driver.
 * @returns {Promise<Partial<IDriver>>} - The created driver.
 */
const createDriverAsStandAlone = async (
  data: CreateDriverAsStandAloneInput
): Promise<Partial<IDriver>> => {
  const existingDriver = await DriverModel.findOne({
    $or: [
      { licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') } },
      { niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } },
    ],
  });

  if (existingDriver) {
    throw new Error('Driver already exists');
  }

  const newDriver = new DriverModel(data);
  const savedDriver = await newDriver.save();
  return savedDriver;
};

/**
 * Service function to update a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to update.
 * @param {UpdateDriverInput} data - The updated data for the driver.
 * @returns {Promise<Partial<IDriver>>} - The updated driver.
 */
const updateDriver = async (
  id: IdOrIdsInput['id'],
  data: UpdateDriverInput,
  userId: string,
  standAloneId?: string
): Promise<Partial<IDriver | null>> => {
  // Build $or conditions only for fields provided in `data`
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const orConditions: any[] = [];

  if (data.licenseNumber) {
    orConditions.push({
      licenseNumber: { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') },
    });
  }
  if (data.niNumber) {
    orConditions.push({ niNumber: { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') } });
  }
  if (data.postCode) {
    orConditions.push({ postCode: { $regex: new RegExp(`^${escapeRegex(data.postCode)}$`, 'i') } });
  }
  if (data.nextCheckDueDate) orConditions.push({ nextCheckDueDate: data.nextCheckDueDate });
  if (data.licenseExpiry) orConditions.push({ licenseExpiry: data.licenseExpiry });
  if (data.licenseExpiryDTC) orConditions.push({ licenseExpiryDTC: data.licenseExpiryDTC });
  if (data.cpcExpiry) orConditions.push({ cpcExpiry: data.cpcExpiry });
  if (typeof data.points !== 'undefined') orConditions.push({ points: data.points });
  if (Array.isArray(data.endorsementCodes) && data.endorsementCodes.length)
    orConditions.push({ endorsementCodes: { $all: data.endorsementCodes } });
  if (data.lastChecked) orConditions.push({ lastChecked: data.lastChecked });
  if (typeof data.checkFrequencyDays !== 'undefined')
    orConditions.push({ checkFrequencyDays: data.checkFrequencyDays });
  if (typeof data.employed !== 'undefined') orConditions.push({ employed: data.employed });
  if (data.checkStatus) orConditions.push({ checkStatus: data.checkStatus });
  if (Array.isArray(data.attachments) && data.attachments.length)
    orConditions.push({ attachments: { $all: data.attachments } });

  if (orConditions.length > 0) {
    const existingDriver = await DriverModel.findOne({
      _id: { $ne: id },
      $or: [
        {
          licenseNumber: data.licenseNumber
            ? { $regex: new RegExp(`^${escapeRegex(data.licenseNumber)}$`, 'i') }
            : undefined,
        },
        {
          niNumber: data.niNumber
            ? { $regex: new RegExp(`^${escapeRegex(data.niNumber)}$`, 'i') }
            : undefined,
        },
      ],
    }).lean();
    if (existingDriver) {
      throw new Error('Duplicate detected: Another driver with the same field(s) already exists.');
    }
  }
  const accessFilters: Record<string, unknown>[] = [
    { createdBy: userId },
    { standAloneId: userId },
  ];

  if (mongoose.Types.ObjectId.isValid(userId)) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    accessFilters.push({ createdBy: userObjectId });
    accessFilters.push({ standAloneId: userObjectId });
  }

  if (standAloneId) {
    accessFilters.push({ standAloneId });
    accessFilters.push({ createdBy: standAloneId });

    if (mongoose.Types.ObjectId.isValid(standAloneId)) {
      const standAloneObjectId = new mongoose.Types.ObjectId(standAloneId);
      accessFilters.push({ standAloneId: standAloneObjectId });
      accessFilters.push({ createdBy: standAloneObjectId });
    }
  }

  // Proceed to update the driver
  const updatedDriver = await DriverModel.findOneAndUpdate(
    {
      _id: id,
      $or: accessFilters,
    },
    data,
    { returnDocument: 'after' }
  );
  return updatedDriver;
};

/**
 * Service function to delete a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete.
 * @returns {Promise<Partial<IDriver>>} - The deleted driver.
 */

// TODO: Before deleting a driver, we should check if there are any related records in DriverTachograph, FuelUsage, or Vehicle collections. If there are related records, we should prevent deletion and throw an error to maintain data integrity.

const deleteDriver = async (
  id: IdOrIdsInput['id'],
  userId: string
): Promise<Partial<IDriver | null>> => {
  const [driverTachographExists, fuelUsageExists, vehicleExists] = await Promise.all([
    DriverTachograph.exists({
      driverId: new mongoose.Types.ObjectId(id),
    }),
    FuelUsage.exists({
      driverId: new mongoose.Types.ObjectId(id),
    }),
    Vehicle.exists({
      driverId: new mongoose.Types.ObjectId(id),
    }),
  ]);

  // if any of the related records exist, prevent deletion and throw an error
  if (driverTachographExists || fuelUsageExists || vehicleExists) {
    throw new Error(
      'Cannot delete driver with associated tachograph records, fuel usage records, or assigned vehicles.'
    );
  }

  const ownershipFilters: Record<string, unknown>[] = [
    { createdBy: userId },
    { standAloneId: userId },
  ];

  if (mongoose.Types.ObjectId.isValid(userId)) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    ownershipFilters.push({ createdBy: userObjectId });
    ownershipFilters.push({ standAloneId: userObjectId });
  }

  const deletedDriver = await DriverModel.findOneAndDelete({
    _id: id,
    $or: ownershipFilters,
  });
  return deletedDriver;
};

/**
 * Service function to retrieve a single driver by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the driver to retrieve.
 * @param {IdOrIdsInput['standAloneId']} [standAloneId] - Optional stand-alone ID for additional filtering.
 * @param {IdOrIdsInput['createdById']} [createdById] - Optional createdBy ID for additional filtering.
 * @returns {Promise<Partial<IDriver>>} - The retrieved driver.
 */
const getDriverById = async (
  id: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id'],
  createdBy?: IdOrIdsInput['id']
): Promise<Partial<IDriver | null>> => {
  const accessFilters: Record<string, mongoose.Types.ObjectId>[] = [];

  if (standAloneId) {
    const standAloneObjectId = new mongoose.Types.ObjectId(standAloneId);
    accessFilters.push({ standAloneId: standAloneObjectId });
    accessFilters.push({ createdBy: standAloneObjectId });
  }

  if (createdBy) {
    accessFilters.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
  }

  const filter = accessFilters.length
    ? {
        _id: id,
        $or: accessFilters,
      }
    : { _id: id };

  const driver = await DriverModel.findOne(filter);
  return driver;
};

/**
 * Service function to retrieve multiple driver based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering driver.
 * @returns {Promise<Partial<IDriver>[]>} - The retrieved driver
 */
const getManyDriver = async (
  query: SearchDriverQueryInput & { createdBy?: string }
): Promise<{
  drivers: Partial<IDriver>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query;

  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  // Search filter
  if (searchKey) {
    searchConditions.push({
      $or: [
        { fullName: { $regex: searchKey, $options: 'i' } },
        { licenseNumber: { $regex: searchKey, $options: 'i' } },
        { niNumber: { $regex: searchKey, $options: 'i' } },
      ],
    });
  }

  // For Transport Manager: filter by BOTH standAloneId (the specific client) AND createdBy (the manager).
  // Using AND ensures we only return drivers belonging to that exact client AND created by this manager.
  if (standAloneId) {
    andConditions.push({ standAloneId: new mongoose.Types.ObjectId(standAloneId) });
    if (createdBy) {
      andConditions.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
    }
  } else if (createdBy) {
    // Stand-alone user: filter by createdBy only
    andConditions.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
  }

  // Final filter build
  const finalFilter: any = {};

  if (searchConditions.length) {
    finalFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    finalFilter.$and = [...(finalFilter.$and || []), ...andConditions];
  }

  // Pagination
  const skipItems = (pageNo - 1) * showPerPage;

  const totalData = await DriverModel.countDocuments(finalFilter);
  const totalPages = Math.ceil(totalData / showPerPage);

  const drivers = await DriverModel.find(finalFilter).skip(skipItems).limit(showPerPage).select('');

  return { drivers, totalData, totalPages };
};

/**
 * Upload a driver attachment to S3 and attach the created document to the driver.
 *
 * Rollback rules:
 * 1) If Document save fails after S3 upload, delete S3 object.
 * 2) If Driver update fails after Document save, delete S3 object and delete Document.
 */
const uploadDriverAttachment = async (
  params: {
    driverId: string;
    userId: string;
    standAloneId?: string;
    simulate?: {
      failAfterS3Upload?: boolean;
      failAfterDocumentSave?: boolean;
    };
  },
  file: UploadedFile
): Promise<{ documentId: string; s3Key: string; url: string; driverId: string }> => {
  const { driverId, userId, standAloneId, simulate } = params;

  const accessFilters: Record<string, unknown>[] = [
    { createdBy: userId },
    { standAloneId: userId },
  ];

  if (mongoose.Types.ObjectId.isValid(userId)) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    accessFilters.push({ createdBy: userObjectId });
    accessFilters.push({ standAloneId: userObjectId });
  }

  if (standAloneId) {
    accessFilters.push({ standAloneId });
    accessFilters.push({ createdBy: standAloneId });

    if (mongoose.Types.ObjectId.isValid(standAloneId)) {
      const standAloneObjectId = new mongoose.Types.ObjectId(standAloneId);
      accessFilters.push({ standAloneId: standAloneObjectId });
      accessFilters.push({ createdBy: standAloneObjectId });
    }
  }

  const driver = await DriverModel.findOne({
    _id: driverId,
    $or: accessFilters,
  })
    .select('_id')
    .lean();

  if (!driver) {
    throw new Error('Driver not found or access denied');
  }

  let uploaded: { Key: string; Location: string } | null = null;
  let createdDocumentId: string | null = null;

  try {
    uploaded = await uploadBuffer(
      file.data,
      undefined,
      file.mimetype || 'application/octet-stream',
      `drivers/${driverId}`
    );

    if (simulate?.failAfterS3Upload) {
      throw new Error('Simulated failure after S3 upload');
    }

    const doc = await DocumentModel.create({
      filename: uploaded.Key.split('/').pop() || uploaded.Key,
      originalName: file.name,
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size,
      url: uploaded.Location,
      s3Key: uploaded.Key,
      uploader: new mongoose.Types.ObjectId(userId),
    });

    createdDocumentId = doc._id.toString();

    if (simulate?.failAfterDocumentSave) {
      throw new Error('Simulated failure after document save');
    }

    const updatedDriver = await DriverModel.findOneAndUpdate(
      {
        _id: driverId,
        $or: accessFilters,
      },
      {
        $addToSet: { attachments: doc._id },
      },
      { returnDocument: 'after' }
    )
      .select('_id')
      .lean();

    if (!updatedDriver) {
      throw new Error('Failed to attach document to driver');
    }

    return {
      documentId: doc._id.toString(),
      s3Key: uploaded.Key,
      url: uploaded.Location,
      driverId: updatedDriver._id.toString(),
    };
  } catch (error) {
    if (uploaded?.Key) {
      try {
        await deleteObject(uploaded.Key);
      } catch (cleanupError) {
        console.error('Failed to rollback S3 object after error:', cleanupError);
      }
    }

    if (createdDocumentId) {
      try {
        await DocumentModel.findByIdAndDelete(createdDocumentId);
      } catch (cleanupError) {
        console.error('Failed to rollback document after error:', cleanupError);
      }
    }

    throw error;
  }
};

export const driverServices = {
  createDriverAsTransportManager,
  createDriverAsStandAlone,
  updateDriver,
  deleteDriver,
  getDriverById,
  getManyDriver,
  uploadDriverAttachment,
};
