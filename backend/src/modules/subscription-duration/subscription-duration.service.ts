import SubscriptionDuration, {
  ISubscriptionDuration,
} from '../../models/subscription-billing/subscriptionDuration.schema';

/**
 * Service function to create a new subscriptionDuration.
 *
 * @param {Partial<ISubscriptionDuration>} data - The data to create a new subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The created subscriptionDuration.
 */
const createSubscriptionDuration = async (
  data: Partial<ISubscriptionDuration>
): Promise<Partial<ISubscriptionDuration>> => {
  // Call the service method to create a new subscription-duration and get the result
  //  !`createdBy` will be derived from the authorization

  // Check if a subscription duration with the same name and duration already exists
  const existingDuration = await SubscriptionDuration.findOne({
    name: data.name,
    durationInDays: data.durationInDays,
  });

  // Prevent duplicate subscription durations
  if (existingDuration) {
    throw new Error('A subscription duration with the same name and duration already exists.');
  }

  const newSubscriptionDuration = new SubscriptionDuration(data);
  const savedSubscriptionDuration = await newSubscriptionDuration.save();
  return savedSubscriptionDuration;
};

/**
 * Service function to create multiple subscriptionDuration.
 *
 * @param {Partial<ISubscriptionDuration>[]} data - An array of data to create multiple subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The created subscriptionDuration.
 */
const createManySubscriptionDuration = async (
  data: Partial<ISubscriptionDuration>[]
): Promise<Partial<ISubscriptionDuration>[]> => {
  const createdSubscriptionDuration = await SubscriptionDuration.insertMany(data);
  return createdSubscriptionDuration;
};

/**
 * Service function to update a single subscriptionDuration by ID.
 *
 * @param {string} id - The ID of the subscriptionDuration to update.
 * @param {Partial<ISubscriptionDuration>} data - The updated data for the subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The updated subscriptionDuration.
 */
const updateSubscriptionDuration = async (
  id: string,
  data: Partial<ISubscriptionDuration>
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! Update Guard: Restrict modification of subscription duration when it is in active use.

  // TODO: Check whether this duration is referenced by any subscription.
  // TODO: If referenced, verify whether any users have purchased that subscription.
  // TODO: If users exist, prevent updating core duration fields (e.g., name, durationInDays).
  // TODO: Allow updating only the status field (isActive) regardless of usage.

  if (data.name && data.durationInDays) {
    // Check if a subscription with the same name and duration already exists
    const isExist = await SubscriptionDuration.findOne({
      name: data.name,
      durationInDays: data.durationInDays,
    });

    // If it exists, throw an error to prevent duplicates
    if (isExist) {
      throw new Error('A subscription with this name and duration already exists');
    }
  }

  // Proceed to update the subscription
  // Example: assuming you have an id to update

  const updatedSubscriptionDuration = await SubscriptionDuration.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionDuration;
};

/**
 * Service function to update multiple subscriptionDuration.
 *
 * @param {Array<{ id: string, updates: Partial<ISubscriptionDuration> }>} data - An array of data to update multiple subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The updated subscriptionDuration.
 */
const updateManySubscriptionDuration = async (
  data: Array<{ id: string; updates: Partial<ISubscriptionDuration> }>
): Promise<Partial<ISubscriptionDuration>[]> => {
  const updatePromises = data.map(({ id, updates }) =>
    SubscriptionDuration.findByIdAndUpdate(id, updates, { new: true })
  );
  const updatedSubscriptionDuration = await Promise.all(updatePromises);
  // Filter out null values
  const validUpdatedSubscriptionDuration = updatedSubscriptionDuration.filter(
    (item) => item !== null
  ) as ISubscriptionDuration[];
  return validUpdatedSubscriptionDuration;
};

/**
 * Service function to delete a single subscriptionDuration by ID.
 *
 * @param {string} id - The ID of the subscriptionDuration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The deleted subscriptionDuration.
 */
const deleteSubscriptionDuration = async (
  id: string
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! If this duration is implemented in any subscription and that subscription is used by any user, do not allow deletion

  // TODO: * First, check if this duration exists in any subscription
  // TODO: * Second, check if any user has taken this subscription
  // TODO: * If taken by any user, throw a thorough error: 'This duration is already assigned to a user's subscription'

  const deletedSubscriptionDuration = await SubscriptionDuration.findByIdAndDelete(id);
  return deletedSubscriptionDuration;
};

/**
 * Service function to delete multiple subscriptionDuration.
 *
 * @param {string[]} ids - An array of IDs of subscriptionDuration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The deleted subscriptionDuration.
 */
const deleteManySubscriptionDuration = async (
  ids: string[]
): Promise<Partial<ISubscriptionDuration>[]> => {
  const subscriptionDurationToDelete = await SubscriptionDuration.find({ _id: { $in: ids } });
  if (!subscriptionDurationToDelete.length)
    throw new Error('No subscriptionDuration found to delete');
  await SubscriptionDuration.deleteMany({ _id: { $in: ids } });
  return subscriptionDurationToDelete;
};

/**
 * Service function to retrieve a single subscriptionDuration by ID.
 *
 * @param {string} id - The ID of the subscriptionDuration to retrieve.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The retrieved subscriptionDuration.
 */
const getSubscriptionDurationById = async (
  id: string
): Promise<Partial<ISubscriptionDuration | null>> => {
  const subscriptionDuration = await SubscriptionDuration.findById(id);
  return subscriptionDuration;
};

/**
 * Service function to retrieve multiple subscriptionDuration based on query parameters.
 *
 * @param {object} query - The query parameters for filtering subscriptionDuration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The retrieved subscriptionDuration
 */
const getManySubscriptionDuration = async (query: {
  searchKey?: string;
  showPerPage: number;
  pageNo: number;
}): Promise<{
  subscriptionDurations: Partial<ISubscriptionDuration>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage, pageNo } = query;

  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { durationInDays: Number(searchKey) || -1 }, // convert searchKey to number
      // If searchKey is not a number, -1 will ensure no match
    ],
  };

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;

  // Find the total count of matching subscriptionDuration
  const totalData = await SubscriptionDuration.countDocuments(searchFilter);

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);

  // Find subscriptionDuration based on the search filter with pagination
  const subscriptionDurations = await SubscriptionDuration.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed

  return { subscriptionDurations, totalData, totalPages };
};

export const subscriptionDurationServices = {
  createSubscriptionDuration,
  createManySubscriptionDuration,
  updateSubscriptionDuration,
  updateManySubscriptionDuration,
  deleteSubscriptionDuration,
  deleteManySubscriptionDuration,
  getSubscriptionDurationById,
  getManySubscriptionDuration,
};

