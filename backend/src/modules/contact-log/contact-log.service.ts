// Import the model
import mongoose from 'mongoose';
import ContactLogModel, { IContactLog } from './../../models/contact/contact-log.schema';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import {
  CreateContactLogInput,
  SearchContactLogQueryInput,
  UpdateContactLogInput,
} from './contact-log.validation';
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildAccessFilters = (id?: IdOrIdsInput['id']): Record<string, unknown>[] => {
  if (!id) {
    return [];
  }

  const normalizedId = String(id);
  const candidates: Array<string | mongoose.Types.ObjectId> = [normalizedId];
  if (mongoose.Types.ObjectId.isValid(normalizedId)) {
    candidates.unshift(new mongoose.Types.ObjectId(normalizedId));
  }

  return [
    { createdBy: { $in: candidates } },
    { standAloneId: { $in: candidates } },
  ];
};

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
  accessId: IdOrIdsInput['id']
): Promise<Partial<IContactLog>> => {
  if (data.date || data.person || data.subject) {
    const existingDoc = await ContactLogModel.findById(id).lean();
    const checkDate = data.date ?? existingDoc?.date;
    const checkPerson = data.person ?? existingDoc?.person;
    const checkSubject = data.subject ?? existingDoc?.subject;

    const existingLog = await ContactLogModel.findOne({
      _id: { $ne: id }, // exclude the current log being updated
      date: checkDate,
      person: checkPerson,
      subject: checkSubject,
    });

    if (existingLog) {
      throw new Error('A contact-log with the same date, person, and subject already exists.');
    }
  }

  const accessFilters: Record<string, unknown>[] = buildAccessFilters(accessId);

  // Proceed to update the contact-log
  const updatedContactLog = await ContactLogModel.findOneAndUpdate(
    {
      _id: id,
      ...(accessFilters.length ? { $or: accessFilters } : {}),
    },
    data,
    { returnDocument: 'after' }
  );

  if (!updatedContactLog) {
    throw new Error('Contact-log not found or access denied');
  }

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
  accessId: IdOrIdsInput['id']
): Promise<void> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(accessId);

  const deletedContactLog = await ContactLogModel.findOneAndDelete({
    _id: id,
    ...(accessFilters.length ? { $or: accessFilters } : {}),
  });

  if (!deletedContactLog) {
    throw new Error('Contact-log not found or access denied');
  }
};

/**
 * Service function to retrieve a single contact-log by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the contact-log to retrieve.
 * @returns {Promise<Partial<IContactLog>>} - The retrieved contact-log.
 */
const getContactLogById = async (
  id: IdOrIdsInput['id'],
  accessId?: IdOrIdsInput['id']
): Promise<Partial<IContactLog | null>> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(accessId);

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
  query: SearchContactLogQueryInput
): Promise<{
  contactLogs: Partial<IContactLog>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId } = query;
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
    const standaloneFilters = buildAccessFilters(standAloneId);

    andConditions.push({
      $or: standaloneFilters,
    });
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

