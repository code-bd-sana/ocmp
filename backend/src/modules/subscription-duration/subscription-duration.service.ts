import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  ISubscriptionDuration,
  SubscriptionDuration,
  SubscriptionPricing,
  UserSubscription,
} from '../../models';
import {
  CreateSubscriptionDurationInput,
  UpdateSubscriptionDurationInput,
} from './subscription-duration.validation';

/**
 * Service function to create a new subscription-duration.
 *
 * @param {CreateSubscriptionDurationInput} data - The data to create a new subscription-duration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The created subscription-duration.
 */
const createSubscriptionDuration = async (
  data: CreateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration>> => {
  // Check if a subscription-duration with the same name and duration already exists
  const existingDuration = await SubscriptionDuration.findOne({
    $or: [{ name: data.name.toUpperCase() }, { durationInDays: data.durationInDays }],
  });
  // Prevent duplicate subscription-durations
  if (existingDuration) {
    throw new Error('A subscription-duration with the same name and duration already exists.');
  }
  // Create and save the new subscription-duration
  const newSubscriptionDuration = new SubscriptionDuration(data);
  const savedSubscriptionDuration = await newSubscriptionDuration.save();
  return savedSubscriptionDuration;
};

/**
 * Service function to update a single subscription-duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-duration to update.
 * @param {UpdateSubscriptionDurationInput} data - The updated data for the subscription-duration.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The updated subscription-duration.
 */
const updateSubscriptionDuration = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionDurationInput
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! Update Guard: Restrict modification of subscription-duration when it is in active use.

  const isDurationReferenced = await SubscriptionPricing.exists({ subscriptionDurationId: id });
  const hasAnyUserPurchasedReferencedDuration = isDurationReferenced
    ? await UserSubscription.exists({
        subscriptionPricingId: {
          $in: await SubscriptionPricing.find({ subscriptionDurationId: id }).distinct('_id'),
        },
      })
    : false;

  if (hasAnyUserPurchasedReferencedDuration) {
    const updateFields = Object.keys(data);
    const isOnlyStatusUpdate =
      updateFields.length > 0 && updateFields.every((key) => key === 'isActive');

    if (!isOnlyStatusUpdate) {
      throw new Error(
        'Cannot update this duration after users have purchased it. Only isActive can be changed.'
      );
    }
  }

  if (!hasAnyUserPurchasedReferencedDuration) {
    // Check duplicate name
    if (data.name) {
      const existingName = await SubscriptionDuration.findOne({
        _id: { $ne: id }, // Exclude current document
        name: data.name.toUpperCase(),
      });

      if (existingName) {
        throw new Error('A subscription-duration with the same name already exists.');
      }
    }

    // Check duplicate durationInDays
    if (data.durationInDays) {
      const existingDuration = await SubscriptionDuration.findOne({
        _id: { $ne: id }, // Exclude current document
        durationInDays: data.durationInDays,
      });

      if (existingDuration) {
        throw new Error('A subscription-duration with the same duration already exists.');
      }
    }
  }

  // Proceed to update the subscription-duration
  const updatedSubscriptionDuration = await SubscriptionDuration.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionDuration;
};

/**
 * Service function to delete a single subscription-duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-duration to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The deleted subscription-duration.
 */
const deleteSubscriptionDuration = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionDuration | null>> => {
  // ! If this duration is implemented in any subscription and that subscription is used by any user, do not allow deletion

  const isDurationInAnySubscription = await SubscriptionPricing.exists({
    subscriptionDurationId: id,
  });
  const hasAnyUserTakenThisSubscription = isDurationInAnySubscription
    ? await UserSubscription.exists({
        subscriptionPricingId: {
          $in: await SubscriptionPricing.find({ subscriptionDurationId: id }).distinct('_id'),
        },
      })
    : false;

  if (hasAnyUserTakenThisSubscription) {
    throw new Error("This duration is already assigned to a user's subscription");
  }

  // Proceed to delete the subscription-duration
  const deletedSubscriptionDuration = await SubscriptionDuration.findOneAndDelete({ _id: id });

  return deletedSubscriptionDuration;
};

/**
 * Service function to delete multiple subscription-durations.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-durations to delete.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The deleted subscription-durations.
 */
const deleteManySubscriptionDuration = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionDuration>[]> => {
  // ! If these durations are implemented in any subscription and that subscription is used by any user, do not allow deletion

  // Proceed to delete the subscription-durations
  const subscriptionDurationToDelete = await SubscriptionDuration.find({ _id: { $in: ids } });
  if (!subscriptionDurationToDelete.length)
    throw new Error('No subscription-duration found to delete');
  // Delete the subscription-durations
  await SubscriptionDuration.deleteMany({ _id: { $in: ids } });
  return subscriptionDurationToDelete;
};

/**
 * Service function to retrieve a single subscription-duration by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-duration to retrieve.
 * @returns {Promise<Partial<ISubscriptionDuration>>} - The retrieved subscription-duration.
 */
const getSubscriptionDurationById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionDuration | null>> => {
  // Find the subscription-duration by ID
  const subscriptionDuration = await SubscriptionDuration.findById(id);
  return subscriptionDuration;
};

/**
 * Service function to retrieve multiple subscription-durations based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-duration.
 * @returns {Promise<Partial<ISubscriptionDuration>[]>} - The retrieved subscription-duration.
 */
const getManySubscriptionDuration = async (
  query: SearchQueryInput
): Promise<{
  subscriptionDurations: Partial<ISubscriptionDuration>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { durationInDays: Number(searchKey) || -1 }, // convert searchKey to number
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription-durations
  const totalData = await SubscriptionDuration.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription-durations based on the search filter with pagination
  const subscriptionDurations = await SubscriptionDuration.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionDurations, totalData, totalPages };
};

export const subscriptionDurationServices = {
  createSubscriptionDuration,
  updateSubscriptionDuration,
  deleteSubscriptionDuration,
  deleteManySubscriptionDuration,
  getSubscriptionDurationById,
  getManySubscriptionDuration,
};
