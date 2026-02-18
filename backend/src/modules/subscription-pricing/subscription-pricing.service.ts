// Import the model

import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  ISubscriptionPricing,
  SubscriptionDuration,
  SubscriptionPlan,
  SubscriptionPricing,
  UserRole,
} from '../../models';
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
): Promise<Partial<ISubscriptionPricing>> => {
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
  return savedSubscriptionPricing;
};

/**
 * Service function to update a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to update.
 * @param {UpdateSubscriptionPricingInput} data - The updated data for the subscription-pricing.
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The updated subscription-pricing.
 */
const updateSubscriptionPricing = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionPricingInput
): Promise<Partial<ISubscriptionPricing | null>> => {
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
  // ! If this subscription-pricing is currently active, prevent updates to core fields (subscriptionPlanId, subscriptionDurationId) and allow only price, currency, and isActive status updates.

  // TODO: First check if any user has purchased this subscription pricing
  // TODO: if (purchased) => then subscriptionPlanId and subscriptionDurationId not allow to update, only price, currency and isActive allow to update
  // Proceed to update the subscription-pricing
  const updatedSubscriptionPricing = await SubscriptionPricing.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionPricing;
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
  // ! if any user purchased this subscription pricing already then not allowed to delete this subscription pricing

  // TODO: First check if any user has purchased this subscription pricing
  // TODO: if (purchased) => then not allowed to delete this subscription pricing
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
  // ! if any user purchased this subscription pricing already then not allowed to delete this subscription pricing

  // TODO: First check if any user has purchased any of these subscription pricing
  // TODO: if (purchased) => then not allowed to delete those subscription pricing which are purchased by user
  await SubscriptionPricing.deleteMany({ _id: { $in: ids } });
  return subscriptionPricingToDelete;
};

/**
 * Service function to retrieve a single subscription-pricing by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to retrieve.
 * @param {UserRole} userRole - Optional user role to determine filtering (SUPER_ADMIN sees all, others see only active)
 * @returns {Promise<Partial<ISubscriptionPricing>>} - The retrieved subscription-pricing.
 */
const getSubscriptionPricingById = async (
  id: IdOrIdsInput['id'],
  userRole?: UserRole
): Promise<Partial<ISubscriptionPricing> | null> => {
  // Determine if user is super admin (has access to all pricing)
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Build query - filter by isActive if not super admin
  const query: any = { _id: new mongoose.Types.ObjectId(id) };
  if (!isSuperAdmin) {
    query.isActive = true;
  }
  // Search by _id with optional isActive filter
  const subscriptionPricing = await SubscriptionPricing.findOne(query);
  return subscriptionPricing;
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
  const { searchKey = '', showPerPage = 10, pageNo = 1, planId, durationId } = query;
  // Calculate the number of items to skip for pagination
  const skipItems = (pageNo - 1) * showPerPage;
  const numericSearch = !isNaN(Number(searchKey)) ? Number(searchKey) : null;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  // Base match condition
  const baseMatch: any = {};
  // If not super admin, only show active subscription pricing
  if (!isSuperAdmin) {
    baseMatch.isActive = true;
  }
  // Optional Filters
  if (planId) {
    baseMatch.subscriptionPlanId = new mongoose.Types.ObjectId(planId);
  }
  // Optional Filters
  if (durationId) {
    baseMatch.subscriptionDurationId = new mongoose.Types.ObjectId(durationId);
  }
  // Build aggregation pipeline
  const aggregationPipeline: mongoose.PipelineStage[] = [
    // Initial match stage based on isActive and optional filters
    { $match: baseMatch },
    // Lookup subscription plan details
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    // Lookup subscription duration details
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
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
    // Sort by creation date (newest first)
    { $sort: { createdAt: -1 } },
    { $skip: skipItems },
    { $limit: showPerPage },
    // Final projection to shape the output
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
  // Execute the aggregation pipeline to get the subscription pricing data
  const subscriptionPricings = await SubscriptionPricing.aggregate(aggregationPipeline);
  // Count Pipeline (same baseMatch + search)
  const totalDataPipeline: mongoose.PipelineStage[] = [
    { $match: baseMatch },
    // Lookup subscription plan details
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPlanId',
        foreignField: '_id',
        as: 'subscriptionPlan',
      },
    },
    { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
    // Lookup subscription duration details
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionDurationId',
        foreignField: '_id',
        as: 'subscriptionDuration',
      },
    },
    { $unwind: { path: '$subscriptionDuration', preserveNullAndEmptyArrays: true } },
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
    // Count the total number of documents that match the criteria
    { $count: 'count' },
  ];
  // Execute the count aggregation pipeline to get the total count of matching subscription pricing records
  const totalCountResult = await SubscriptionPricing.aggregate(totalDataPipeline);
  const totalData = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);
  // Return the retrieved subscription pricing data along with pagination details
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
