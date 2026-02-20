// Import the model

import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  ISubscriptionPricing,
  SubscriptionDuration,
  SubscriptionHistory,
  SubscriptionPlan,
  SubscriptionPricing,
  UserRole,
  UserSubscription,
} from '../../models';
import { TSubscriptionPricing } from './subscription-pricing.interface';
import {
  CreateSubscriptionPricingInput,
  SubscriptionPricingSearchQueries,
  UpdateSubscriptionPricingInput,
} from './subscription-pricing.validation';

/**
 * Service function to create a new subscription-pricing.
 *
 * @param {CreateSubscriptionPricingInput} data - The data to create a new subscription-pricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The created subscription-pricing.
 */
const createSubscriptionPricing = async (
  data: CreateSubscriptionPricingInput
): Promise<Partial<TSubscriptionPricing | null>> => {
  // Extract subscription plan and duration IDs from validated data
  const { subscriptionPlanId, subscriptionDurationId } = data;
  // Check if the subscription plan exists
  const isSubscriptionPlanAvailable = await SubscriptionPlan.findOne({
    _id: subscriptionPlanId,
  });
  // Check if the subscription duration exists
  const isSubscriptionDurationAvailable = await SubscriptionDuration.findOne({
    _id: subscriptionDurationId,
  });
  // Throw error if subscription plan is not found
  if (!isSubscriptionPlanAvailable) {
    throw new Error('Subscription-plan not found');
  }
  // Throw error if subscription duration is not found
  if (!isSubscriptionDurationAvailable) {
    throw new Error('Subscription-duration not found');
  }
  // Check if a pricing entry already exists for the given subscription plan and duration
  const isExistingPricing = await SubscriptionPricing.findOne({
    subscriptionPlanId,
    subscriptionDurationId,
  });
  if (isExistingPricing) {
    throw new Error('Subscription-pricing already exists for the selected plan and duration');
  }
  const newSubscriptionPricing = new SubscriptionPricing(data);
  const savedSubscriptionPricing = await newSubscriptionPricing.save();

  return await getSubscriptionPricingById(
    savedSubscriptionPricing._id.toString(),
    UserRole.SUPER_ADMIN
  );
};

/**
 * Service function to update a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to update.
 * @param {UpdateSubscriptionPricingInput} data - The updated data for the subscription-pricing.
 * @returns {Promise<Partial<TSubscriptionPricing>>} - The updated subscription-pricing.
 */
const updateSubscriptionPricing = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionPricingInput
): Promise<Partial<TSubscriptionPricing | null>> => {
  // Check for duplicate (filed) combination
  const existingSubscriptionPricing = await SubscriptionPricing.findOne({
    subscriptionPlanId: data.subscriptionPlanId,
    subscriptionDurationId: data.subscriptionDurationId,
  });
  // Prevent duplicate updates
  if (existingSubscriptionPricing) {
    throw new Error(
      'Duplicate detected: Another subscription-pricing with the same fieldName already exists.'
    );
  }

  // Check if the subscription-plan exists
  const [durationInUserSubscription, subscriptionHistory] = await Promise.all([
    await UserSubscription.exists({ subscriptionDurationId: new mongoose.Types.ObjectId(id) }),
    await SubscriptionHistory.exists({ subscriptionDurationId: new mongoose.Types.ObjectId(id) }),
  ]);

  if (durationInUserSubscription || subscriptionHistory) {
    // If trying to update any field other than isActive, throw an error
    if (data.isActive === undefined) {
      throw new Error(
        'This subscription pricing is currently in use. You can only update the status of this subscription pricing. If you want to update any other field, please create a new subscription pricing with the desired changes and deactivate this one.'
      );
    }

    // If trying to update the isActive field, allow it but throw a warning message about the impact of changing the status.
    if (data.isActive === false) {
      await SubscriptionPricing.findByIdAndUpdate(id, { isActive: false });

      throw new Error(
        'This subscription pricing has been deactivated. Please note that deactivating a subscription pricing will prevent new purchases of this plan-duration combination, but it will not affect existing subscriptions. Existing subscribers will continue to have access until their current subscription period ends.'
      );
    } else if (data.isActive === true) {
      await SubscriptionPricing.findByIdAndUpdate(id, { isActive: true });

      throw new Error(
        'This subscription pricing has been re-activated. Please note that re-activating a subscription pricing will allow new purchases of this plan-duration combination, but it will not affect existing subscriptions. Existing subscribers will continue to have access as long as their subscription is active.'
      );
    }

    throw new Error(
      'This subscription pricing is currently in use. You can only update the status of this subscription pricing. If you want to update any other field, please create a new subscription pricing with the desired changes and deactivate this one.'
    );
  }

  // Proceed to update the subscription-pricing
  await SubscriptionPricing.findByIdAndUpdate(id, data);

  return await getSubscriptionPricingById(id, UserRole.SUPER_ADMIN);
};

/**
 * Service function to delete a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The deleted subscription-pricing.
 */
const deleteSubscriptionPricing = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionPricing | null>> => {
  // Check if the subscription-plan exists
  const [durationInUserSubscription, subscriptionHistory] = await Promise.all([
    await UserSubscription.exists({ subscriptionDurationId: new mongoose.Types.ObjectId(id) }),
    await SubscriptionHistory.exists({ subscriptionDurationId: new mongoose.Types.ObjectId(id) }),
  ]);

  // If this subscription-duration is currently in use in any subscription or subscription history, do not allow deleting this subscription pricing. If trying to delete, throw an error message about the impact of deleting this subscription pricing.
  if (durationInUserSubscription || subscriptionHistory) {
    throw new Error(
      'This subscription pricing is currently in use. You cannot delete this subscription pricing. If you want to make this subscription pricing unavailable for new subscribers, please update the status of this subscription pricing to inactive.'
    );
  }

  const deletedSubscriptionPricing = await SubscriptionPricing.findByIdAndDelete(id);
  return deletedSubscriptionPricing;
};

/**
 * Service function to delete multiple subscription-pricing(s).
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of subscription-pricing to delete.
 * @returns {Promise<Partial<ISubscriptionPricing>[]>} - The deleted subscription-pricing(s).
 */
const deleteManySubscriptionPricing = async (
  ids: IdOrIdsInput['ids']
): Promise<Partial<ISubscriptionPricing>[]> => {
  const subscriptionPricingToDelete = await SubscriptionPricing.find({ _id: { $in: ids } });
  if (!subscriptionPricingToDelete.length)
    throw new Error('No subscription-pricing found to delete');

  // Check if the subscription-plan exists
  const [durationInUserSubscription, subscriptionHistory] = await Promise.all([
    await UserSubscription.exists({
      subscriptionDurationId: { $in: ids?.map((id) => new mongoose.Types.ObjectId(id)) },
    }),
    await SubscriptionHistory.exists({
      subscriptionDurationId: { $in: ids?.map((id) => new mongoose.Types.ObjectId(id)) },
    }),
  ]);

  // If any of these subscription-duration is currently in use in any subscription or subscription history, do not allow deleting these subscription pricing. If trying to delete, throw an error message about the impact of deleting these subscription pricing.
  if (durationInUserSubscription || subscriptionHistory) {
    throw new Error(
      'One or more of these subscription pricing are currently in use. You cannot delete these subscription pricing. If you want to make these subscription pricing unavailable for new subscribers, please update the status of these subscription pricing to inactive.'
    );
  }

  await SubscriptionPricing.deleteMany({ _id: { $in: ids } });
  return subscriptionPricingToDelete;
};

/**
 * Service function to retrieve a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to retrieve.
 * @param {UserRole} userRole - Optional user role to determine filtering (SUPER_ADMIN sees all, others see only active)
 * @returns {Promise<Partial<TSubscriptionPricing>>} - The retrieved subscription-pricing.
 */
const getSubscriptionPricingById = async (
  id: IdOrIdsInput['id'],
  userRole?: UserRole
): Promise<Partial<TSubscriptionPricing> | null> => {
  // Determine if user is super admin (has access to all pricing)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build query - filter by isActive if not super admin
  const query: any = { _id: new mongoose.Types.ObjectId(id) };
  if (!isSuperAdmin) {
    query.isActive = true;
  }
  // Search by _id with optional isActive filter
  const subscriptionPricing = await SubscriptionPricing.aggregate([
    { $match: query },
    // Lookup subscription plan
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    // Lookup subscription duration
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
    // Final projection
    {
      $project: {
        _id: 1,
        subscriptionPlanName: '$subscriptionPlan.name',
        subscriptionPlanType: '$subscriptionPlan.planType',
        applicableAccountType: '$subscriptionPlan.applicableAccountType',
        subscriptionPlanDescription: '$subscriptionPlan.description',
        subscriptionPlanStatus: '$subscriptionPlan.isActive',
        subscriptionDurationStatus: '$subscriptionDuration.isActive',
        subscriptionName: '$subscriptionDuration.name',
        subscriptionDuration: '$subscriptionDuration.durationInDays',
        price: 1,
        currency: 1,
        isActive: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]).exec();

  return subscriptionPricing[0] || null;
};

/**
 * Service function to retrieve multiple subscription-pricing based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-pricing.
 * @param {UserRole} userRole - Optional user role to determine filtering (SUPER_ADMIN sees all, others see only active)
 * @returns {Promise<Partial<ISubscriptionPricing & { subscriptionPlanName: string; subscriptionDuration: string }>[]>} - The retrieved subscription-pricing
 */
const getManySubscriptionPricing = async (
  query: SubscriptionPricingSearchQueries,
  userRole?: UserRole
) => {
  // Extract query parameters with defaults
  const {
    searchKey = '',
    showPerPage = 10,
    pageNo = 1,
    planId,
    durationId,
    applicableAccountType,
  } = query;
  // Calculate skip for pagination
  const skipItems = (pageNo - 1) * showPerPage;
  const numericSearch = !isNaN(Number(searchKey)) ? Number(searchKey) : null;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Base match: only active if not super admin
  const baseMatch: any = {};
  if (!isSuperAdmin) baseMatch.isActive = true;
  if (planId) baseMatch.subscriptionPlanId = new mongoose.Types.ObjectId(planId);
  if (durationId) baseMatch.subscriptionDurationId = new mongoose.Types.ObjectId(durationId);
  // Build aggregation pipeline
  const aggregationPipeline: mongoose.PipelineStage[] = [
    { $match: baseMatch },
    // Lookup subscription plan
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    // Apply account type filter AFTER lookup
    ...(applicableAccountType
      ? [
          {
            $match: {
              'subscriptionPlan.applicableAccountType': applicableAccountType,
            },
          },
        ]
      : []),
    // Lookup subscription duration
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
    // Active checks for non-super-admin
    ...(!isSuperAdmin
      ? [
          {
            $match: {
              'subscriptionPlan.isActive': true,
              'subscriptionDuration.isActive': true,
            },
          },
        ]
      : []),
    // Search filter
    ...(searchKey
      ? [
          {
            $match: {
              $or: [
                { currency: { $regex: searchKey, $options: 'i' } },
                { 'subscriptionPlan.name': { $regex: searchKey, $options: 'i' } },
                ...(numericSearch !== null ? [{ price: numericSearch }] : []),
                ...(numericSearch !== null
                  ? [{ 'subscriptionDuration.durationInDays': numericSearch }]
                  : []),
              ],
            },
          },
        ]
      : []),
    // Sort & paginate
    { $sort: { createdAt: -1 } },
    { $skip: skipItems },
    { $limit: showPerPage },
    // Final projection
    {
      $project: {
        _id: 1,
        subscriptionPlanName: '$subscriptionPlan.name',
        subscriptionPlanType: '$subscriptionPlan.planType',
        applicableAccountType: '$subscriptionPlan.applicableAccountType',
        subscriptionPlanDescription: '$subscriptionPlan.description',
        subscriptionPlanStatus: '$subscriptionPlan.isActive',
        subscriptionDurationStatus: '$subscriptionDuration.isActive',
        subscriptionName: '$subscriptionDuration.name',
        subscriptionDuration: '$subscriptionDuration.durationInDays',
        price: 1,
        currency: 1,
        isActive: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];
  // Execute aggregation pipeline
  const subscriptionPricings = await SubscriptionPricing.aggregate(aggregationPipeline);
  // Total count pipeline
  const totalCountPipeline: mongoose.PipelineStage[] = [
    // Apply same filters as data retrieval but without pagination stages
    { $match: baseMatch },
    // Lookup subscription plan
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    // Unwind subscription plan
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    // Apply account type filter AFTER lookup
    ...(applicableAccountType
      ? [
          {
            $match: {
              'subscriptionPlan.applicableAccountType': applicableAccountType,
            },
          },
        ]
      : []),
    // Lookup subscription duration
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    // Unwind subscription duration
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
    // Active checks for non-super-admin
    ...(!isSuperAdmin
      ? [
          {
            $match: {
              'subscriptionPlan.isActive': true,
              'subscriptionDuration.isActive': true,
            },
          },
        ]
      : []),
    ...(searchKey
      ? [
          {
            $match: {
              $or: [
                { currency: { $regex: searchKey, $options: 'i' } },
                { 'subscriptionPlan.name': { $regex: searchKey, $options: 'i' } },
                ...(numericSearch !== null ? [{ price: numericSearch }] : []),
                ...(numericSearch !== null
                  ? [{ 'subscriptionDuration.durationInDays': numericSearch }]
                  : []),
              ],
            },
          },
        ]
      : []),
    // Account type filter
    { $count: 'count' },
  ];

  const totalCountResult = await SubscriptionPricing.aggregate(totalCountPipeline);
  const totalData = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { subscriptionPricings, totalData, totalPages };
};

export const subscriptionPricingServices = {
  createSubscriptionPricing,
  updateSubscriptionPricing,
  deleteSubscriptionPricing,
  deleteManySubscriptionPricing,
  getSubscriptionPricingById,
  getManySubscriptionPricing,
};
