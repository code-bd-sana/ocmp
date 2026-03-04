// Import the model
import mongoose from 'mongoose';
import MeetingNoteModel, { IMeetingNote } from '../../models/meeting-note/meetingNote.schema';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import {
  CreateMeetingNoteInput,
  SearchMeetingNoteQueryInput,
  UpdateMeetingNoteInput,
} from './meeting-note.validation';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Service function to create a new meeting-note.
 *
 * @param {CreateMeetingNoteInput} data - The data to create a new meeting-note.
 * @returns {Promise<Partial<IMeetingNote>>} - The created meeting-note.
 */
const createMeetingNote = async (data: CreateMeetingNoteInput): Promise<Partial<IMeetingNote>> => {
  const or: any[] = [];
  // Add any unique fields to the or condition for duplicate check
  if (data.keyDiscussionPoints) {
    or.push({
      keyDiscussionPoints: {
        $regex: new RegExp(`^${escapeRegex(data.keyDiscussionPoints)}$`, 'i'),
      },
    });
  }
  // Add more fields as needed

  if (or.length > 0) {
    const existingMeetingNote = await MeetingNoteModel.findOne({ $or: or }).lean();
    if (existingMeetingNote) throw new Error('Meeting-note already exists');
  }

  const newMeetingNote = new MeetingNoteModel(data);

  const savedMeetingNote = await newMeetingNote.save();
  return savedMeetingNote;
};

/**
 * Service function to update a single meeting-note by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to update.
 * @param {UpdateMeetingNoteInput} data - The updated data for the meeting-note.
 * @returns {Promise<Partial<IMeetingNote>>} - The updated meeting-note.
 */
const updateMeetingNote = async (
  id: IdOrIdsInput['id'],
  data: UpdateMeetingNoteInput,
  userId: IdOrIdsInput['id'],
  standAloneId: IdOrIdsInput['id']
): Promise<Partial<IMeetingNote | null>> => {
  // Check for duplicate (filed) combination
  const orConditions: any[] = [];
  if (data.keyDiscussionPoints) {
    orConditions.push({
      keyDiscussionPoints: {
        $regex: new RegExp(`^${escapeRegex(data.keyDiscussionPoints)}$`, 'i'),
      },
    });
  }
  // Add more fields as needed

  if (orConditions.length > 0) {
    const existingMeetingNote = await MeetingNoteModel.findOne({
      _id: { $ne: id }, // Exclude the current document
      $or: orConditions,
    }).lean();
    if (existingMeetingNote) {
      throw new Error(
        'Duplicate detected: Another meeting-note with the same keyDiscussionPoints already exists.'
      );
    }
  }

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

  // Proceed to update the meeting-note

  // const updatedMeetingNote = await MeetingNoteModel.findByIdAndUpdate(id, data, { new: true });
  const updatedMeetingNote = await MeetingNoteModel.findOneAndUpdate(
    {
      _id: id,
      $or: accessFilters,
    },
    data,
    { returnDocument: 'after' }
  );
  return updatedMeetingNote;
};

/**
 * Service function to delete a single meeting-note by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to delete.
 * @returns {Promise<Partial<IMeetingNote>>} - The deleted meeting-note.
 */
const deleteMeetingNote = async (
  id: IdOrIdsInput['id'],
  userId: IdOrIdsInput['id'],
  standAloneId: IdOrIdsInput['id']
): Promise<Partial<IMeetingNote | null>> => {
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
  const deletedMeetingNote = await MeetingNoteModel.findOneAndDelete({
    _id: id,
    $or: accessFilters,
  });
  return deletedMeetingNote;
};

/**
 * Service function to retrieve a single meeting-note by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to retrieve.
 * @returns {Promise<Partial<IMeetingNote>>} - The retrieved meeting-note.
 */
const getMeetingNoteById = async (
  id: IdOrIdsInput['id'],
  standAloneId?: IdOrIdsInput['id'],
  createdBy?: IdOrIdsInput['id']
): Promise<Partial<IMeetingNote | null>> => {
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

  const meetingNote = await MeetingNoteModel.findOne(filter);
  return meetingNote;
};

/**
 * Service function to retrieve multiple meeting-note based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering meeting-note.
 * @returns {Promise<Partial<IMeetingNote>[]>} - The retrieved meeting-note
 */
const getAllMeetingNote = async (
  query: SearchMeetingNoteQueryInput & { createdBy?: string }
): Promise<{
  meetingNotes: Partial<IMeetingNote>[];
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
        { task: { $regex: searchKey, $options: 'i' } },
        { responsibleParty: { $regex: searchKey, $options: 'i' } },
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
  // Find the total count of matching meeting-note
  const totalData = await MeetingNoteModel.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find meeting-notes based on the search filter with pagination
  const meetingNotes = await MeetingNoteModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { meetingNotes, totalData, totalPages };
};

export const meetingNoteServices = {
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote,
  getMeetingNoteById,
  getAllMeetingNote,
};
