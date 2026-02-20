// Import the model

import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  ISubscriptionPlan,
  SubscriptionHistory,
  SubscriptionPlan,
  SubscriptionPricing,
  UserRole,
  UserSubscription,
} from '../../models';
import {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from './subscription-plan.validation';

/**
 * Service function to create a new subscription-plan.
 *
 * @param {CreateSubscriptionPlanInput} data - The data to create a new subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The created subscription-plan.
 */
const createSubscriptionPlan = async (
  data: CreateSubscriptionPlanInput
): Promise<Partial<ISubscriptionPlan>> => {
  // Check if the subscription plan already exists
  const existingPlan = await SubscriptionPlan.findOne({ name: data.name });
  // If the plan exists
  if (existingPlan) {
    throw new Error('Subscription-plan already exists');
  }
  const newSubscriptionPlan = new SubscriptionPlan(data);
  const savedSubscriptionPlan = await newSubscriptionPlan.save();
  return savedSubscriptionPlan;
};

/**
 * Service function to update a single subscription-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to update.
 * @param {UpdateSubscriptionPlanInput} data - The updated data for the subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The updated subscription-plan.
 */
const updateSubscriptionPlan = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionPlanInput
): Promise<Partial<ISubscriptionPlan | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionPlan = await SubscriptionPlan.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [
      {
        name: data.name?.toUpperCase(),
      },
    ],
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionPlan) {
    throw new Error(
      'Duplicate detected: Another subscription-plan with the same fieldName already exists.'
    );
  }

  // Check if the subscription-plan exists
  const [durationInPricing, durationInUserSubscription, subscriptionHistory] = await Promise.all([
    await SubscriptionPricing.exists({ subscriptionPlanId: new mongoose.Types.ObjectId(id) }),
    await UserSubscription.exists({ subscriptionPlanId: new mongoose.Types.ObjectId(id) }),
    await SubscriptionHistory.exists({ subscriptionPlanId: new mongoose.Types.ObjectId(id) }),
  ]);

  // If this subscription-plan is currently in use in any subscription pricing, user subscription or subscription history, only allow updating the isActive field. If trying to update any other field, throw an error. If trying to update the isActive field, allow it but throw a warning message about the impact of changing the status.
  if (durationInPricing || durationInUserSubscription || subscriptionHistory) {
    // If trying to update any field other than isActive, throw an error
    if (data.isActive === undefined) {
      throw new Error(
        'This subscription plan is currently in use. You can only update the isActive field to activate/deactivate this plan.'
      );
    }

    if (data.isActive === false) {
      await SubscriptionPlan.findByIdAndUpdate(id, { isActive: false });

      throw new Error(
        'This subscription plan has been deactivated. However, it is currently in use, so it will still be available for existing users until they change their subscription plan or their subscription expires. New users will not be able to see or purchase this plan.'
      );
    } else if (data.isActive === true) {
      await SubscriptionPlan.findByIdAndUpdate(id, { isActive: true });

      throw new Error(
        'This subscription plan has been activated. It will now be available for all users to see and purchase.'
      );
    }

    throw new Error(
      'This subscription plan is currently in use. You can only update the status (isActive) field.'
    );
  }

  // Proceed to update the subscription-plan
  const updatedSubscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(id, data, { new: true });
  return updatedSubscriptionPlan;
};

/**
 * Service function to delete a single subscription-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The deleted subscription-plan.
 */
const deleteSubscriptionPlan = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPlan | null>> => {
  // Check if the subscription-plan exists
  const [durationInPricing, durationInUserSubscription, subscriptionHistory] = await Promise.all([
    await SubscriptionPricing.exists({ subscriptionPlanId: new mongoose.Types.ObjectId(id) }),
    await UserSubscription.exists({ subscriptionPlanId: new mongoose.Types.ObjectId(id) }),
    await SubscriptionHistory.exists({ subscriptionPlanId: new mongoose.Types.ObjectId(id) }),
  ]);

  // If this subscription-plan is currently in use in any subscription or subscription history, do not allow deleting this plan. Throw an error message about the impact of deleting this plan.
  if (durationInPricing || durationInUserSubscription || subscriptionHistory) {
    throw new Error('This subscription plan is currently in use. You cannot delete this plan. ');
  }

  const deletedSubscriptionPlan = await SubscriptionPlan.findByIdAndDelete(id);
  return deletedSubscriptionPlan;
};

/**
 * Service function to delete multiple subscription-plan.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-plan to delete.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The deleted subscription-plan.
 */
const deleteManySubscriptionPlan = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionPlan>[]> => {
  const subscriptionPlanToDelete = await SubscriptionPlan.find({ _id: { $in: ids } });
  if (!subscriptionPlanToDelete.length) throw new Error('No subscription-plan found to delete');

  const [durationInPricing, durationInUserSubscription, subscriptionHistory] = await Promise.all([
    await SubscriptionPricing.exists({
      subscriptionPlanId: { $in: ids?.map((id) => new mongoose.Types.ObjectId(id)) },
    }),
    await UserSubscription.exists({
      subscriptionPlanId: { $in: ids?.map((id) => new mongoose.Types.ObjectId(id)) },
    }),
    await SubscriptionHistory.exists({
      subscriptionPlanId: { $in: ids?.map((id) => new mongoose.Types.ObjectId(id)) },
    }),
  ]);

  // If any of these subscription-plans are currently in use in any subscription or subscription history, do not allow deleting these plans. Throw an error message about the impact of deleting these plans.
  if (durationInPricing || durationInUserSubscription || subscriptionHistory) {
    throw new Error(
      'Some of these subscription plans are currently in use. You cannot delete these plans. '
    );
  }

  await SubscriptionPlan.deleteMany({ _id: { $in: ids } });
  return subscriptionPlanToDelete;
};

/**
 * Service function to retrieve a single subscription-plan by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-plan to retrieve.
 * @param {UserRole} userRole - The role of the user making the request.
 * @returns {Promise<Partial<ISubscriptionPlan>>} - The retrieved subscription-plan.
 */
const getSubscriptionPlanById = async (
  id: IdOrIdsInput['id'],
  userRole: UserRole
): Promise<Partial<ISubscriptionPlan | null>> => {
  // Determine if user is super admin (has access to all pricing)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build query - filter by isActive if not super admin
  const query: any = { _id: new mongoose.Types.ObjectId(id) };
  if (!isSuperAdmin) {
    query.isActive = true;
  }
  const subscriptionPlan = await SubscriptionPlan.findOne(query);
  return subscriptionPlan;
};

/**
 * Service function to retrieve multiple subscription-plan based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-plan.
 * @returns {Promise<Partial<ISubscriptionPlan>[]>} - The retrieved subscription-plans.
 */
const getManySubscriptionPlan = async (
  query: SearchQueryInput,
  userRole: UserRole
): Promise<{
  subscriptionPlans: Partial<ISubscriptionPlan>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { name: { $regex: searchKey, $options: 'i' } }, // string search
      { planType: { $regex: searchKey, $options: 'i' } }, // string search
      { applicableAccountType: { $regex: searchKey, $options: 'i' } }, // string search
    ],
  };
  // If user is not super admin, add filter to show only active subscription-plans
  if (!isSuperAdmin) {
    Object.assign(searchFilter, { isActive: true });
  }
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching subscription-plan
  const totalData = await SubscriptionPlan.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find subscription-plans based on the search filter with pagination
  const subscriptionPlans = await SubscriptionPlan.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { subscriptionPlans, totalData, totalPages };
};

export const subscriptionPlanServices = {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  deleteManySubscriptionPlan,
  getSubscriptionPlanById,
  getManySubscriptionPlan,
};
