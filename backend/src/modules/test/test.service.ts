// Import the model
import TestModel, { ITest } from './test.model';

/**
 * Service function to create a new test.
 *
 * @param {Partial<ITest>} data - The data to create a new test.
 * @returns {Promise<Partial<ITest>>} - The created test.
 */
const createTest = async (data: Partial<ITest>): Promise<Partial<ITest>> => {
  const newTest = new TestModel(data);
  const savedTest = await newTest.save();
  return savedTest;
};

/**
 * Service function to create multiple test.
 *
 * @param {Partial<ITest>[]} data - An array of data to create multiple test.
 * @returns {Promise<Partial<ITest>[]>} - The created test.
 */
const createManyTest = async (data: Partial<ITest>[]): Promise<Partial<ITest>[]> => {
  const createdTest = await TestModel.insertMany(data);
  return createdTest;
};

/**
 * Service function to update a single test by ID.
 *
 * @param {string} id - The ID of the test to update.
 * @param {Partial<ITest>} data - The updated data for the test.
 * @returns {Promise<Partial<ITest>>} - The updated test.
 */
const updateTest = async (id: string, data: Partial<ITest>): Promise<Partial<ITest | null>> => {
  const updatedTest = await TestModel.findByIdAndUpdate(id, data, { new: true });
  return updatedTest;
};

/**
 * Service function to update multiple test.
 *
 * @param {Array<{ id: string, updates: Partial<ITest> }>} data - An array of data to update multiple test.
 * @returns {Promise<Partial<ITest>[]>} - The updated test.
 */
const updateManyTest = async (data: Array<{ id: string, updates: Partial<ITest> }>): Promise<Partial<ITest>[]> => {
  const updatePromises = data.map(({ id, updates }) =>
    TestModel.findByIdAndUpdate(id, updates, { new: true })
  );
  const updatedTest = await Promise.all(updatePromises);
  // Filter out null values
  const validUpdatedTest = updatedTest.filter(item => item !== null) as ITest[];
  return validUpdatedTest;
};

/**
 * Service function to delete a single test by ID.
 *
 * @param {string} id - The ID of the test to delete.
 * @returns {Promise<Partial<ITest>>} - The deleted test.
 */
const deleteTest = async (id: string): Promise<Partial<ITest | null>> => {
  const deletedTest = await TestModel.findByIdAndDelete(id);
  return deletedTest;
};

/**
 * Service function to delete multiple test.
 *
 * @param {string[]} ids - An array of IDs of test to delete.
 * @returns {Promise<Partial<ITest>[]>} - The deleted test.
 */
const deleteManyTest = async (ids: string[]): Promise<Partial<ITest>[]> => {
  const testToDelete = await TestModel.find({ _id: { $in: ids } });
  if (!testToDelete.length) throw new Error('No test found to delete');
  await TestModel.deleteMany({ _id: { $in: ids } });
  return testToDelete; 
};

/**
 * Service function to retrieve a single test by ID.
 *
 * @param {string} id - The ID of the test to retrieve.
 * @returns {Promise<Partial<ITest>>} - The retrieved test.
 */
const getTestById = async (id: string): Promise<Partial<ITest | null>> => {
  const test = await TestModel.findById(id);
  return test;
};

/**
 * Service function to retrieve multiple test based on query parameters.
 *
 * @param {object} query - The query parameters for filtering test.
 * @returns {Promise<Partial<ITest>[]>} - The retrieved test
 */
const getManyTest = async (query: {
  searchKey?: string;
  showPerPage: number;
  pageNo: number;
}): Promise<{ tests: Partial<ITest>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage, pageNo } = query;

  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { fieldName: { $regex: searchKey, $options: 'i' } },
      { fieldName: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed
    ],
  };

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;

  // Find the total count of matching test
  const totalData = await TestModel.countDocuments(searchFilter);

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);

  // Find test based on the search filter with pagination
  const tests = await TestModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed

  return { tests, totalData, totalPages };
};

export const testServices = {
  createTest,
  createManyTest,
  updateTest,
  updateManyTest,
  deleteTest,
  deleteManyTest,
  getTestById,
  getManyTest,
};