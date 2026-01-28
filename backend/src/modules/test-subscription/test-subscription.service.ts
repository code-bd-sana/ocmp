// Import the model

import SubscriptionPlan from '../../models/subscription-billing/subscriptionPlan.schema';
import TestSubscriptionModel, { ITestSubscription } from './test-subscription.model';

/**
 * Service function to create a new testSubscription.
 *
 * @param {Partial<ITestSubscription>} data - The data to create a new testSubscription.
 * @returns {Promise<Partial<ITestSubscription>>} - The created testSubscription.
 */
const createTestSubscription = async (
  data: Partial<ITestSubscription>
): Promise<Partial<ITestSubscription>> => {
  /**
   * Check if a subscription plan with the same name already exists
   * if exists, throw an error
   * ohterwise, create a new subscription plan
   */

  const isExistPlan = await SubscriptionPlan.findOne({ name: data.name }); // -- check existing plan by name

  if (isExistPlan) {
    throw new Error('Subscription plan with this name already exists');
  } // -- if exists, throw error

  // if not exists, create new plan

  const newTestSubscription = new SubscriptionPlan(data);
  const savedTestSubscription = await newTestSubscription.save();

  return savedTestSubscription; // return created plan
};

/**
 * Service function to create multiple testSubscription.
 *
 * @param {Partial<ITestSubscription>[]} data - An array of data to create multiple testSubscription.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The created testSubscription.
 */
const createManyTestSubscription = async (
  data: Partial<ITestSubscription>[]
): Promise<Partial<ITestSubscription>[]> => {
  const createdTestSubscription = await TestSubscriptionModel.insertMany(data);
  return createdTestSubscription;
};

/**
 * Service function to update a single testSubscription by ID.
 *
 * @param {string} id - The ID of the testSubscription to update.
 * @param {Partial<ITestSubscription>} data - The updated data for the testSubscription.
 * @returns {Promise<Partial<ITestSubscription>>} - The updated testSubscription.
 */
const updateTestSubscription = async (
  id: string,
  data: Partial<ITestSubscription>
): Promise<Partial<ITestSubscription | null>> => {
  // ! If subscription plan any user is using, then do not allow to change/update plan

  // *TODO: First Ceck if any user is using this plan, then do not allow to change plan name
  // *TODO: Implement this logic later

  /**
   * If Sucbscription Plan name is already exist in other plan, then do not allow to change the name
   *
   *
   */

  // chcek if plan name is already exist in other plan
  if (data.name) {
    const isExistPlan = await SubscriptionPlan.findOne({ name: data.name });

    if (isExistPlan) {
      throw new Error('Subscription plan with this name already exists');
    }
  }

  // Update the testSubscription by ID

  const updatedTestSubscription = await SubscriptionPlan.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedTestSubscription;
};

/**
 * Service function to update multiple testSubscription.
 *
 * @param {Array<{ id: string, updates: Partial<ITestSubscription> }>} data - An array of data to update multiple testSubscription.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The updated testSubscription.
 */
const updateManyTestSubscription = async (
  data: Array<{ id: string; updates: Partial<ITestSubscription> }>
): Promise<Partial<ITestSubscription>[]> => {
  const updatePromises = data.map(({ id, updates }) =>
    TestSubscriptionModel.findByIdAndUpdate(id, updates, { new: true })
  );
  const updatedTestSubscription = await Promise.all(updatePromises);
  // Filter out null values
  const validUpdatedTestSubscription = updatedTestSubscription.filter(
    (item) => item !== null
  ) as ITestSubscription[];
  return validUpdatedTestSubscription;
};

/**
 * Service function to delete a single testSubscription by ID.
 *
 * @param {string} id - The ID of the testSubscription to delete.
 * @returns {Promise<Partial<ITestSubscription>>} - The deleted testSubscription.
 */
const deleteTestSubscription = async (id: string): Promise<Partial<ITestSubscription | null>> => {
  /**
   * Check This subscriptin model is existing or not
   * If not existing, throw error
   */

  // chcek this subscription plan is existing or not
  const existingPlan = await SubscriptionPlan.findById(id);
  if (!existingPlan) {
    throw new Error('Subscription plan not found');
  }

  /**
   *
   * If Sucbscription Plan any user is using, then do not allow to delete plan
   *
   * TODO: First Ceck  If any user is using this plan - isUserUsingPlan
   * TODO: if isUserUsingPlan is true, then do not allow to delete the plan
   * TODO: Implement this logic later
   */

  // if any user do not using this plan, then allow to delete

  // delete the testSubscription by ID
  const deletedTestSubscription = await SubscriptionPlan.findByIdAndDelete(id);
  return deletedTestSubscription;
};

/**
 * Service function to delete multiple testSubscription.
 *
 * @param {string[]} ids - An array of IDs of testSubscription to delete.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The deleted testSubscription.
 */
const deleteManyTestSubscription = async (ids: string[]): Promise<Partial<ITestSubscription>[]> => {
  console.log(ids, 'usre id chcek');
  /**
   *
   * If Sucbscription Plan any user is using, then do not allow to delete plan
   *
   * TODO: First Ceck  If any user is using this plan - isUserUsingPlan
   * TODO: if isUserUsingPlan is true, then do not allow to delete the plan
   * TODO: Implement this logic later
   */

  // if any user do not using this plan, then allow to delete

  // delete the testSubscription by ID
  const subscriptionPlan = await SubscriptionPlan.find({ _id: { $in: ids } });
  if (!subscriptionPlan.length) throw new Error('No testSubscription found to delete');
  await SubscriptionPlan.deleteMany({ _id: { $in: ids } });
  return subscriptionPlan;
};

/**
 * Service function to retrieve a single testSubscription by ID.
 *
 * @param {string} id - The ID of the testSubscription to retrieve.
 * @returns {Promise<Partial<ITestSubscription>>} - The retrieved testSubscription.
 */
const getTestSubscriptionById = async (id: string): Promise<Partial<ITestSubscription | null>> => {
  const testSubscription = await SubscriptionPlan.findById(id);
  return testSubscription;
};

/**
 * Service function to retrieve multiple testSubscription based on query parameters.
 *
 * @param {object} query - The query parameters for filtering testSubscription.
 * @returns {Promise<Partial<ITestSubscription>[]>} - The retrieved testSubscription
 */
const getManyTestSubscription = async (query: {
  searchKey?: string;
  showPerPage: number;
  pageNo: number;
}): Promise<{
  testSubscriptions: Partial<ITestSubscription>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage, pageNo } = query;

  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } },
      { planType: { $regex: searchKey, $options: 'i' } },
      { applicableAccountType: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed
    ],
  };

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;

  // Find the total count of matching testSubscription
  const totalData = await SubscriptionPlan.countDocuments(searchFilter);

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);

  // Find testSubscription based on the search filter with pagination
  const testSubscriptions = await SubscriptionPlan.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed

  return { testSubscriptions, totalData, totalPages };
};

export const testSubscriptionServices = {
  createTestSubscription,
  createManyTestSubscription,
  updateTestSubscription,
  updateManyTestSubscription,
  deleteTestSubscription,
  deleteManyTestSubscription,
  getTestSubscriptionById,
  getManyTestSubscription,
};

