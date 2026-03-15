// Import the model
import mongoose from 'mongoose';
import ContactLogModel, { IContactLog } from './../../models/contact/contact-log.schema';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  CreateContactLogInput,
  SearchContactLogQueryInput,
  UpdateContactLogInput,
} from './contact-log.validation';
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service function to create a new contact-log.
 *
 * @param {CreateContactLogInput} data - The data to create a new contact-log.
 * @returns {Promise<Partial<IContactLog>>} - The created contact-log.
 */
const createContactLog = async (data: CreateContactLogInput): Promise<Partial<IContactLog>> => {
  const existingLog = await ContactLogModel.findOne({
    date: data.date,
    person: data.person,
    subject: data.subject,
  });

  if (existingLog) {
    throw new Error('A contact-log with the same date, person, and subject already exists.');
  }
  const newContactLog = new ContactLogModel(data);
  const savedContactLog = await newContactLog.save();
  return savedContactLog;
};

/**
 * Service function to update a single contact-log by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to update.
 * @param {UpdateContactLogInput} data - The updated data for the contact-log.
 * @returns {Promise<Partial<IContactLog>>} - The updated contact-log.
 */
const updateContactLog = async (
  id: IdOrIdsInput['id'],
  data: UpdateContactLogInput,
  userId: IdOrIdsInput['id'],
  standAloneId: IdOrIdsInput['id']
): Promise<Partial<IContactLog | null>> => {
  if (data.date || data.person || data.subject) {
    const existingLog = await ContactLogModel.findOne({
      _id: { $ne: id }, // exclude the current log being updated
      date: data.date,
      person: data.person,
      subject: data.subject,
    });

    if (existingLog) {
      throw new Error('A contact-log with the same date, person, and subject already exists.');
    }
  }

  // Build access filters based on userId and standAloneId
  const accessFilters: Record<string, unknown>[] = [];

  if (userId) {
    accessFilters.push({ createdBy: userId });
    accessFilters.push({ standAloneId: userId });

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      accessFilters.push({ createdBy: userObjectId });
      accessFilters.push({ standAloneId: userObjectId });
    }
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
  // Proceed to update the contact-log
  const updatedContactLog = await ContactLogModel.findOneAndUpdate(
    {
      _id: id,
      $or: accessFilters,
    },
    data,
    { returnDocument: 'after' }
  );
  return updatedContactLog;
};

/**
 * Service function to delete a single contact-log by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to delete.
 * @returns {Promise<Partial<IContactLog>>} - The deleted contact-log.
 */
const deleteContactLog = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId: IdOrIdsInput['id']
): Promise<Partial<IContactLog | null>> => {
  const accessFilters: Record<string, unknown>[] = [];

  if (userId) {
    accessFilters.push({ createdBy: userId });
    accessFilters.push({ standAloneId: userId });

    if (mongoose.Types.ObjectId.isValid(userId)) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      accessFilters.push({ createdBy: userObjectId });
      accessFilters.push({ standAloneId: userObjectId });
    }
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
  const deletedContactLog = await ContactLogModel.findOneAndDelete({
    _id: id,
    $or: accessFilters,
  });
  return deletedContactLog;
};

/**
 * Service function to retrieve a single contact-log by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to retrieve.
 * @returns {Promise<Partial<IContactLog>>} - The retrieved contact-log.
 */
const getContactLogById = async (
  id: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id'],
  createdBy?: IdOrIdsInput['id']
): Promise<Partial<IContactLog | null>> => {
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

  const contactLog = await ContactLogModel.findOne(filter);
  return contactLog;
};

/**
 * Service function to retrieve multiple contact-log based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering contact-log.
 * @returns {Promise<Partial<IContactLog>[]>} - The retrieved contact-log
 */
const getManyContactLog = async (
  query: SearchContactLogQueryInput & { createdBy?: string }
): Promise<{
  contactLogs: Partial<IContactLog>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId, createdBy } = query;
  // Build the search filter based on the search key
  const searchConditions: any[] = [];
  const andConditions: any[] = [];

  if (searchKey) {
    searchConditions.push({
      $or: [
        { contactMethod: { $regex: escapeRegex(searchKey), $options: 'i' } },
        { person: { $regex: escapeRegex(searchKey), $options: 'i' } },
        { subject: { $regex: escapeRegex(searchKey), $options: 'i' } },
        { outcome: { $regex: escapeRegex(searchKey), $options: 'i' } },
      ],
    });
  }

  if (standAloneId) {
    andConditions.push({
      $or: [
        { standAloneId: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(standAloneId) },
        { createdBy: new mongoose.Types.ObjectId(createdBy!) },
      ],
    });
  } else if (createdBy) {
    andConditions.push({ createdBy: new mongoose.Types.ObjectId(createdBy) });
  }

  const searchFilter: any = {};

  if (searchConditions.length) {
    searchFilter.$and = searchConditions;
  }

  if (andConditions.length) {
    searchFilter.$and = [...(searchFilter.$and || []), ...andConditions];
  }

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching contact-log
  const totalData = await ContactLogModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find contact-logs based on the search filter with pagination
  const contactLogs = await ContactLogModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { contactLogs, totalData, totalPages };
};

export const contactLogServices = {
  createContactLog,
  updateContactLog,
  deleteContactLog,
  getContactLogById,
  getManyContactLog,
};

