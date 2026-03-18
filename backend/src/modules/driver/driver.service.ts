// Import the model
import mongoose from 'mongoose';
import { UploadedFile } from 'express-fileupload';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { DriverTachograph, FuelUsage, Vehicle } from '../../models';
import DocumentModel from '../../models/document.schema';
import DriverModel, { IDriver } from '../../models/vehicle-transport/driver.schema';
import { deleteObjects, getSignedDownloadUrl } from '../../utils/aws/s3';
import {
  rollbackUploadedDocuments,
  uploadFilesAndCreateDocuments,
} from '../../utils/aws/document-upload';
import {
  CreateDriverAsStandAloneInput,
  CreateDriverAsTransportManagerInput,
  SearchDriverQueryInput,
  UpdateDriverInput,
} from './driver.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface DriverAttachmentResponse {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  downloadUrl: string;
}

type DriverWithAttachmentsResponse = Omit<Partial<IDriver>, 'attachments'> & {
  attachments?: DriverAttachmentResponse[];
};

const withSignedAttachmentUrls = async (
  driver: IDriver | (Partial<IDriver> & { _id: mongoose.Types.ObjectId })
): Promise<DriverWithAttachmentsResponse> => {
  const attachmentIds = Array.isArray(driver.attachments)
    ? driver.attachments
        .map((id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id)))
        .filter(Boolean)
    : [];

  if (!attachmentIds.length) {
    return {
      ...(driver as Partial<IDriver>),
      attachments: [],
    } as DriverWithAttachmentsResponse;
  }

  const documents = await DocumentModel.find({ _id: { $in: attachmentIds } })
    .select('_id filename originalName mimeType size url s3Key')
    .lean();

  const signedDocuments = await Promise.all(
    documents.map(async (doc) => {
      let downloadUrl = doc.url;
      try {
        downloadUrl = await getSignedDownloadUrl(doc.s3Key);
      } catch {
        // Fallback to stored S3 URL if signed URL generation fails.
      }

      return {
        _id: String(doc._id),
        filename: doc.filename,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        size: doc.size,
        url: doc.url,
        downloadUrl,
      } as DriverAttachmentResponse;
    })
  );

  const byId = new Map(signedDocuments.map((doc) => [doc._id, doc]));
  const orderedAttachments = attachmentIds
    .map((id) => byId.get(String(id)))
    .filter((doc): doc is DriverAttachmentResponse => Boolean(doc));

  return {
    ...(driver as Partial<IDriver>),
    attachments: orderedAttachments,
  } as DriverWithAttachmentsResponse;
};

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
  standAloneId?: string,
  files: UploadedFile[] = [],
  removeAttachmentIds: string[] = []
): Promise<Partial<IDriver | null>> => {
  const sanitizedData: UpdateDriverInput = { ...data };
  delete (sanitizedData as any).attachments;
  delete (sanitizedData as any).removeAttachmentIds;

  // Build $or conditions only for fields provided in `data`
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const orConditions: any[] = [];

  if (sanitizedData.licenseNumber) {
    orConditions.push({
      licenseNumber: { $regex: new RegExp(`^${escapeRegex(sanitizedData.licenseNumber)}$`, 'i') },
    });
  }
  if (sanitizedData.niNumber) {
    orConditions.push({
      niNumber: { $regex: new RegExp(`^${escapeRegex(sanitizedData.niNumber)}$`, 'i') },
    });
  }
  if (sanitizedData.postCode) {
    orConditions.push({
      postCode: { $regex: new RegExp(`^${escapeRegex(sanitizedData.postCode)}$`, 'i') },
    });
  }
  if (sanitizedData.nextCheckDueDate)
    orConditions.push({ nextCheckDueDate: sanitizedData.nextCheckDueDate });
  if (sanitizedData.licenseExpiry) orConditions.push({ licenseExpiry: sanitizedData.licenseExpiry });
  if (sanitizedData.licenseExpiryDTC)
    orConditions.push({ licenseExpiryDTC: sanitizedData.licenseExpiryDTC });
  if (sanitizedData.cpcExpiry) orConditions.push({ cpcExpiry: sanitizedData.cpcExpiry });
  if (typeof sanitizedData.points !== 'undefined') orConditions.push({ points: sanitizedData.points });
  if (Array.isArray(sanitizedData.endorsementCodes) && sanitizedData.endorsementCodes.length)
    orConditions.push({ endorsementCodes: { $all: sanitizedData.endorsementCodes } });
  if (sanitizedData.lastChecked) orConditions.push({ lastChecked: sanitizedData.lastChecked });
  if (typeof sanitizedData.checkFrequencyDays !== 'undefined')
    orConditions.push({ checkFrequencyDays: sanitizedData.checkFrequencyDays });
  if (typeof sanitizedData.employed !== 'undefined') orConditions.push({ employed: sanitizedData.employed });
  if (sanitizedData.checkStatus) orConditions.push({ checkStatus: sanitizedData.checkStatus });

  if (orConditions.length > 0) {
    const existingDriver = await DriverModel.findOne({
      _id: { $ne: id },
      $or: [
        {
          licenseNumber: sanitizedData.licenseNumber
            ? { $regex: new RegExp(`^${escapeRegex(sanitizedData.licenseNumber)}$`, 'i') }
            : undefined,
        },
        {
          niNumber: sanitizedData.niNumber
            ? { $regex: new RegExp(`^${escapeRegex(sanitizedData.niNumber)}$`, 'i') }
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

  const ownershipFilter = {
    _id: id,
    $or: accessFilters,
  };

  const existingDriver = await DriverModel.findOne(ownershipFilter)
    .select('_id attachments')
    .lean();

  if (!existingDriver) {
    return null;
  }

  const normalizedRemoveIds = Array.from(
    new Set(
      removeAttachmentIds
        .filter((item) => mongoose.Types.ObjectId.isValid(item))
        .map((item) => String(item))
    )
  );

  const currentAttachmentIds = Array.isArray(existingDriver.attachments)
    ? existingDriver.attachments.map((item) => String(item))
    : [];

  const removableAttachmentIds = normalizedRemoveIds.filter((item) =>
    currentAttachmentIds.includes(item)
  );

  if (removableAttachmentIds.length) {
    const documentsToDelete = await DocumentModel.find({
      _id: {
        $in: removableAttachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)),
      },
    })
      .select('_id s3Key')
      .lean();

    const keysToDelete = documentsToDelete.map((doc) => doc.s3Key).filter(Boolean);

    // Required order for update removal flow: S3 deletion first, then Document rows.
    if (keysToDelete.length) {
      await deleteObjects(keysToDelete);
    }

    if (documentsToDelete.length) {
      await DocumentModel.deleteMany({
        _id: { $in: documentsToDelete.map((doc) => doc._id) },
      });
    }
  }

  let uploadedDocuments: Awaited<ReturnType<typeof uploadFilesAndCreateDocuments>>['documents'] = [];

  if (files.length) {
    const uploadResult = await uploadFilesAndCreateDocuments(files, userId, `driver/${String(id)}`);
    uploadedDocuments = uploadResult.documents;
  }

  const updateQuery: Record<string, unknown> = {};

  const setData: Record<string, unknown> = {};
  const settableFields: Array<keyof UpdateDriverInput> = [
    'fullName',
    'licenseNumber',
    'postCode',
    'niNumber',
    'nextCheckDueDate',
    'licenseExpiry',
    'licenseExpiryDTC',
    'cpcExpiry',
    'points',
    'endorsementCodes',
    'lastChecked',
    'checkFrequencyDays',
    'employed',
    'checkStatus',
  ];

  for (const key of settableFields) {
    if (typeof sanitizedData[key] !== 'undefined') {
      setData[key] = sanitizedData[key];
    }
  }

  if (Object.keys(setData).length) {
    updateQuery.$set = setData;
  }

  if (uploadedDocuments.length) {
    updateQuery.$addToSet = {
      attachments: {
        $each: uploadedDocuments.map((doc) => doc._id as mongoose.Types.ObjectId),
      },
    };
  }

  if (removableAttachmentIds.length) {
    updateQuery.$pull = {
      attachments: {
        $in: removableAttachmentIds.map((docId) => new mongoose.Types.ObjectId(docId)),
      },
    };
  }

  // Final guard against ConflictingUpdateOperators on attachments.
  if (updateQuery.$set && (updateQuery.$set as Record<string, unknown>).attachments) {
    delete (updateQuery.$set as Record<string, unknown>).attachments;
    if (!Object.keys(updateQuery.$set as Record<string, unknown>).length) {
      delete updateQuery.$set;
    }
  }

  if (!Object.keys(updateQuery).length) {
    const currentDriver = await DriverModel.findOne(ownershipFilter).lean();
    return currentDriver as Partial<IDriver> | null;
  }

  try {
    // Proceed to update the driver
    const updatedDriver = await DriverModel.findOneAndUpdate(ownershipFilter, updateQuery, {
      returnDocument: 'after',
    });
    return updatedDriver;
  } catch (error) {
    if (uploadedDocuments.length) {
      await rollbackUploadedDocuments(uploadedDocuments);
    }
    throw error;
  }
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
): Promise<DriverWithAttachmentsResponse | null> => {
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

  const driver = await DriverModel.findOne(filter).lean();
  if (!driver) return null;

  return withSignedAttachmentUrls(driver as Partial<IDriver> & { _id: mongoose.Types.ObjectId });
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

  // Determine the SA user's ID:
  //   - TM passes it as standAloneId (the client they're viewing)
  //   - SA passes it as createdBy (their own ID, set by the controller)
  // A driver belongs to an SA user if EITHER:
  //   a) standAloneId = SA_id  (created by TM on behalf of SA user)
  //   b) createdBy   = SA_id  (created by SA user themselves)
  const ownerId = standAloneId || createdBy;
  if (ownerId) {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    andConditions.push({
      $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
    });
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

const uploadDriverAttachments = async (
  id: IdOrIdsInput['id'],
  userId: string,
  files: UploadedFile[],
  standAloneId?: string
): Promise<{
  driver: Partial<IDriver>;
  documents: { _id: mongoose.Types.ObjectId; url: string }[];
}> => {
  if (!files.length) {
    throw new Error('No files provided for upload');
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

  const ownershipFilter = {
    _id: id,
    $or: accessFilters,
  };

  const existingDriver = await DriverModel.findOne(ownershipFilter).select('_id');
  if (!existingDriver) {
    throw new Error('Driver not found or access denied');
  }

  const { documents } = await uploadFilesAndCreateDocuments(files, userId, `driver/${String(id)}`);

  try {
    const documentIds = documents.map((doc) => doc._id as mongoose.Types.ObjectId);

    const updatedDriver = await DriverModel.findOneAndUpdate(
      ownershipFilter,
      {
        $addToSet: {
          attachments: { $each: documentIds },
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedDriver) {
      throw new Error('Driver not found or access denied');
    }

    return {
      driver: updatedDriver,
      documents: documents.map((doc) => ({
        _id: doc._id as mongoose.Types.ObjectId,
        url: doc.url,
      })),
    };
  } catch (error) {
    await rollbackUploadedDocuments(documents);
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
  uploadDriverAttachments,
};
