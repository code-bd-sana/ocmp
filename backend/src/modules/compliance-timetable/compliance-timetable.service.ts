// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput } from '../../handlers/common-zod-validator';
import {
  CreateComplianceTimetableAsStandAloneInput,
  CreateComplianceTimetableAsTransportManagerInput,
  SearchComplianceTimetableQueryInput,
  UpdateComplianceTimetableInput,
} from './compliance-timetable.validation';
import { ComplianceTimeTable, IComplianceTimeTable } from '../../models';

const buildAccessFilters = (id?: string): Record<string, unknown>[] => {
  if (!id) {
    return [];
  }

  const candidates: Array<string | mongoose.Types.ObjectId> = [id];
  if (mongoose.Types.ObjectId.isValid(id)) {
    candidates.unshift(new mongoose.Types.ObjectId(id));
  }

  return [{ createdBy: { $in: candidates } }, { standAloneId: { $in: candidates } }];
};

/**
 * Service function to create a new compliance-timetable.
 * It checks for duplicates based on the task field (case-insensitive) before creating a new document.
 * @param {CreateComplianceTimetableAsStandAloneInput | CreateComplianceTimetableAsTransportManagerInput} data - The data for the new compliance-timetable.
 * @returns {Promise<Partial<IComplianceTimeTable>>} - The created compliance-timetable.
 * @throws {Error} - Throws an error if a duplicate compliance-timetable is found.
 */
const createComplianceTimetable = async (
  data:
    | CreateComplianceTimetableAsStandAloneInput
    | CreateComplianceTimetableAsTransportManagerInput
): Promise<Partial<IComplianceTimeTable>> => {
  const newComplianceTimetable = new ComplianceTimeTable(data);
  const savedComplianceTimetable = await newComplianceTimetable.save();
  return savedComplianceTimetable;
};

/**
 * Service function to update a compliance-timetable by ID.
 * It checks for duplicates based on the task field (case-insensitive) before updating the document.
 * Access control is enforced by ensuring the user has ownership (createdBy or standAloneId).
 *
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to update.
 * @param {UpdateComplianceTimetableInput} data - The updated data for the compliance-timetable.
 * @param {IdOrIdsInput['id']} userId - The ID of the user making the request (for access control).
 * @param {IdOrIdsInput['id']} [standAloneId] - The stand-alone ID for additional access control (optional).
 * @returns {Promise<Partial<IComplianceTimeTable>>} - The updated compliance-timetable.
 * @throws {Error} - Throws an error if a duplicate compliance-timetable is found or if the user does not have access.
 */
const updateComplianceTimetable = async (
  id: IdOrIdsInput['id'],
  data: UpdateComplianceTimetableInput,
  accessId: IdOrIdsInput['id']
): Promise<Partial<IComplianceTimeTable>> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(
    accessId ? String(accessId) : undefined
  );

  // Proceed to update the compliance-timetable
  const updatedComplianceTimetable = await ComplianceTimeTable.findOneAndUpdate(
    {
      _id: id,
      ...(accessFilters.length ? { $or: accessFilters } : {}),
    },
    data,
    { returnDocument: 'after' }
  );

  if (!updatedComplianceTimetable) {
    throw new Error('Compliance-timetable not found or access denied');
  }

  return updatedComplianceTimetable;
};

/**
 * Service function to delete a compliance-timetable by ID.
 * Access control is enforced by ensuring the user has ownership (createdBy or standAloneId).
 *
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to delete.
 * @param {IdOrIdsInput['id']} userId - The ID of the user making the request (for access control).
 * @param {IdOrIdsInput['id']} [standAloneId] - The stand-alone ID for additional access control (optional).
 * @returns {Promise<Partial<IComplianceTimeTable | null>>} - The deleted compliance-timetable.
 * @throws {Error} - Throws an error if the user does not have access or if the compliance-timetable is not found.
 */
const deleteComplianceTimetable = async (
  id: IdOrIdsInput['id'],
  accessId: IdOrIdsInput['id']
): Promise<void> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(
    accessId ? String(accessId) : undefined
  );

  const deletedComplianceTimetable = await ComplianceTimeTable.findOneAndDelete({
    _id: id,
    ...(accessFilters.length ? { $or: accessFilters } : {}),
  });

  if (!deletedComplianceTimetable) {
    throw new Error('Compliance-timetable not found or access denied');
  }
};

/**
 * Service function to retrieve a single compliance-timetable by ID.
 * Access control is enforced by ensuring the user has ownership (createdBy or standAloneId).
 *
 * @param {IdOrIdsInput['id']} id - The ID of the compliance-timetable to retrieve.
 * @param {IdOrIdsInput['id']} [standAloneId] - The stand-alone ID for additional access control (optional).
 * @param {IdOrIdsInput['id']} [createdBy] - The createdBy ID for additional access control (optional).
 * @returns {Promise<Partial<IComplianceTimeTable | null>>} - The retrieved compliance-timetable.
 * @throws {Error} - Throws an error if the user does not have access or if the compliance-timetable is not found.
 */
const getComplianceTimetableById = async (
  id: IdOrIdsInput['id'],
  accessId?: IdOrIdsInput['id']
): Promise<Partial<IComplianceTimeTable | null>> => {
  const accessFilters: Record<string, unknown>[] = buildAccessFilters(
    accessId ? String(accessId) : undefined
  );

  const filter = accessFilters.length
    ? {
        _id: id,
        $or: accessFilters,
      }
    : { _id: id };

  const complianceTimetable = await ComplianceTimeTable.findOne(filter);
  return complianceTimetable;
};

/**
 * Service function to retrieve all compliance-timetable with pagination and search.
 * It supports searching by task and responsibleParty fields (case-insensitive) and filtering by standAloneId or createdBy for access control.
 *
 * @param {SearchComplianceTimetableQueryInput & { createdBy?: string }} query - The search and pagination parameters, including optional createdBy for access control.
 * @returns {Promise<{ complianceTimetables: Partial<IComplianceTimeTable>[]; totalData: number; totalPages: number }>} - The retrieved compliance-timetable along with pagination info.
 * @throws {Error} - Throws an error if the query parameters are invalid.
 */
const getAllComplianceTimetable = async (
  query: SearchComplianceTimetableQueryInput & { createdBy?: string; standAloneId?: string }
): Promise<{
  complianceTimetables: Partial<IComplianceTimeTable>[];
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

  // A spot-check belongs to an SA user if EITHER:
  //   a) standAloneId = SA_id  (created by TM on behalf of SA user)
  //   b) createdBy   = SA_id  (created by SA user themselves)
  const ownerId = standAloneId || createdBy;
  if (ownerId) {
    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
    andConditions.push({
      $or: [{ standAloneId: ownerObjectId }, { createdBy: ownerObjectId }],
    });
  }

  if (standAloneId) {
    const standaloneFilters = buildAccessFilters(String(standAloneId));

    andConditions.push({ $or: standaloneFilters });
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
  // Find the total count of matching compliance-timetable
  const totalData = await ComplianceTimeTable.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find compliance-timetables based on the search filter with pagination
  const complianceTimetables = await ComplianceTimeTable.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { complianceTimetables, totalData, totalPages };
};
// const getAllComplianceTimetable = async (
//   query: SearchComplianceTimetableQueryInput
// ): Promise<{
//   complianceTimetables: Partial<IComplianceTimeTable>[];
//   totalData: number;
//   totalPages: number;
// }> => {
//   const { searchKey = '', showPerPage = 10, pageNo = 1, standAloneId } = query;
//   // Build the search filter based on the search key
//   const searchConditions: any[] = [];
//   const andConditions: any[] = [];

//   if (searchKey) {
//     searchConditions.push({
//       $or: [
//         { task: { $regex: searchKey, $options: 'i' } },
//         { responsibleParty: { $regex: searchKey, $options: 'i' } },
//       ],
//     });
//   }

//   if (standAloneId) {
//     const standaloneFilters = buildAccessFilters(String(standAloneId));

//     andConditions.push({ $or: standaloneFilters });
//   }

//   const searchFilter: any = {};

//   if (searchConditions.length) {
//     searchFilter.$and = searchConditions;
//   }

//   if (andConditions.length) {
//     searchFilter.$and = [...(searchFilter.$and || []), ...andConditions];
//   }
//   // Calculate the number of items to skip based on the page number
//   const skipItems = (pageNo - 1) * showPerPage;
//   // Find the total count of matching compliance-timetable
//   const totalData = await ComplianceTimeTable.countDocuments(searchFilter);
//   // Calculate the total number of pages
//   const totalPages = Math.ceil(totalData / showPerPage);
//   // Find compliance-timetables based on the search filter with pagination
//   const complianceTimetables = await ComplianceTimeTable.find(searchFilter)
//     .skip(skipItems)
//     .limit(showPerPage)
//     .select(''); // Keep/Exclude any field if needed
//   return { complianceTimetables, totalData, totalPages };
// };

/**
 * Exporting all service functions related to compliance-timetable as an object for easy import in controllers.
 */
export const complianceTimetableServices = {
  createComplianceTimetable,
  updateComplianceTimetable,
  deleteComplianceTimetable,
  getComplianceTimetableById,
  getAllComplianceTimetable,
};
