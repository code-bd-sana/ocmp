// Import the model
import mongoose from 'mongoose';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { ISubscriptionCoupon, SubscriptionCoupon, SubscriptionPricing, User } from '../../models';
import {
  CreateSubscriptionCouponInput,
  UpdateSubscriptionCouponInput,
} from './subscription-coupon.validation';

/**
 * Service function to create a new subscription-coupon.
 *
 * @param {CreateSubscriptionCouponInput} data - The data to create a new subscription-coupon.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The created subscription-coupon.
 */
const createSubscriptionCoupon = async (
  data: CreateSubscriptionCouponInput
): Promise<Partial<ISubscriptionCoupon>> => {
  // Destructure the relevant fields from the input data
  const { code, users } = data;
  const normalizedCode = code.toUpperCase().trim();
  // Check for duplicate code
  const existingSubscriptionCoupon = await SubscriptionCoupon.findOne({
    code: normalizedCode,
  }).lean();
  // Check for duplicate code and prevent creation if a duplicate exists
  if (existingSubscriptionCoupon) {
    throw new Error('Duplicate detected: A subscription-coupon with the same code already exists.');
  }
  // Validate user IDs if provided
  const userIds = users?.map((u) => new mongoose.Types.ObjectId(u));
  // Validate user IDs if provided
  const userExistenceChecks = await User.find({ _id: { $in: userIds } })
    .select('_id')
    .lean();
  // Extract existing user IDs from the database results
  const existingUserIds = userExistenceChecks.map((u) => u._id.toString());
  // Identify any non-existing user IDs from the input
  const nonExistingUserIds = userIds?.filter((u) => !existingUserIds.includes(u.toString()));
  // If there are any non-existing user IDs, throw an error with details
  if (nonExistingUserIds && nonExistingUserIds.length > 0) {
    throw new Error(
      `Validation error: The following user IDs do not exist: ${nonExistingUserIds.join(', ')}`
    );
  }
  // Validate subscription pricing IDs if provided
  const subscriptionPricingIds = data.subscriptionPricings?.map(
    (sp) => new mongoose.Types.ObjectId(sp)
  );
  const subscriptionPricingExistenceChecks = await SubscriptionPricing.find({
    _id: { $in: subscriptionPricingIds },
  })
    .select('_id')
    .lean();
  // Extract existing subscription pricing IDs from the database results
  const existingSubscriptionPricingIds = subscriptionPricingExistenceChecks.map((sp) =>
    sp._id.toString()
  );
  // Identify any non-existing subscription pricing IDs from the input
  const nonExistingSubscriptionPricingIds = subscriptionPricingIds?.filter(
    (sp) => !existingSubscriptionPricingIds.includes(sp.toString())
  );
  // If there are any non-existing subscription pricing IDs, throw an error with details
  if (nonExistingSubscriptionPricingIds && nonExistingSubscriptionPricingIds.length > 0) {
    throw new Error(
      `Validation error: The following subscription pricing IDs do not exist: ${nonExistingSubscriptionPricingIds.join(', ')}`
    );
  }
  // Proceed to create the new subscription-coupon
  const newSubscriptionCoupon = new SubscriptionCoupon(data);
  const savedSubscriptionCoupon = await newSubscriptionCoupon.save();
  return savedSubscriptionCoupon;
};

/**
 * Service function to update a single subscription-coupon by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to update.
 * @param {UpdateSubscriptionCouponInput} data - The updated data for the subscription-coupon.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The updated subscription-coupon.
 */
const updateSubscriptionCoupon = async (
  id: IdOrIdsInput['id'],
  data: UpdateSubscriptionCouponInput
): Promise<Partial<ISubscriptionCoupon | null>> => {
  // Check for duplicate code if the code is being updated
  const existingSubscriptionCoupon = await SubscriptionCoupon.findOne({
    _id: { $ne: id }, // Exclude the current document
    code: data.code ? data.code.toUpperCase().trim() : undefined, // Check for duplicate code if it's being updated
  }).lean();
  // Prevent duplicate updates
  if (existingSubscriptionCoupon) {
    throw new Error(
      'Duplicate detected: Another subscription-coupon with the same code already exists.'
    );
  }
  // Validate user IDs if provided
  const userIds = data.users?.map((u) => new mongoose.Types.ObjectId(u));
  const userExistenceChecks = await User.find({ _id: { $in: userIds } })
    .select('_id')
    .lean();
  const existingUserIds = userExistenceChecks.map((u) => u._id.toString());
  const nonExistingUserIds = userIds?.filter((u) => !existingUserIds.includes(u.toString()));
  if (nonExistingUserIds && nonExistingUserIds.length > 0) {
    throw new Error(
      `Validation error: The following user IDs do not exist: ${nonExistingUserIds.join(', ')}`
    );
  }
  // Validate subscription pricing IDs if provided
  const subscriptionPricingIds = data.subscriptionPricings?.map(
    (sp) => new mongoose.Types.ObjectId(sp)
  );
  // Check existence of subscription pricing IDs and identify any non-existing IDs
  const subscriptionPricingExistenceChecks = await SubscriptionPricing.find({
    _id: { $in: subscriptionPricingIds },
  })
    .select('_id')
    .lean();
  // Extract existing subscription pricing IDs from the database results
  const existingSubscriptionPricingIds = subscriptionPricingExistenceChecks.map((sp) =>
    sp._id.toString()
  );
  // Identify any non-existing subscription pricing IDs from the input
  const nonExistingSubscriptionPricingIds = subscriptionPricingIds?.filter(
    (sp) => !existingSubscriptionPricingIds.includes(sp.toString())
  );
  // If there are any non-existing subscription pricing IDs, throw an error with details
  if (nonExistingSubscriptionPricingIds && nonExistingSubscriptionPricingIds.length > 0) {
    throw new Error(
      `Validation error: The following subscription pricing IDs do not exist: ${nonExistingSubscriptionPricingIds.join(', ')}`
    );
  }
  // Proceed to update the subscription-coupon
  const updatedSubscriptionCoupon = await SubscriptionCoupon.findByIdAndUpdate(id, data, {
    new: true,
  });
  return updatedSubscriptionCoupon;
};

/**
 * Service function to delete a single subscription-coupon by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to delete.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The deleted subscription-coupon.
 */
const deleteSubscriptionCoupon = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionCoupon | null>> => {
  const deletedSubscriptionCoupon = await SubscriptionCoupon.findByIdAndDelete(id);
  return deletedSubscriptionCoupon;
};

/**
 * Service function to retrieve a single subscription-coupon by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to retrieve.
 * @returns {Promise<Partial<ISubscriptionCoupon>>} - The retrieved subscription-coupon.
 */
const getSubscriptionCouponById = async (
  id: IdOrIdsInput['id']
): Promise<Partial<ISubscriptionCoupon> | null> => {
  const aggregationPipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    // Lookup users
    {
      $lookup: {
        from: 'users',
        localField: 'users',
        foreignField: '_id',
        as: 'users',
      },
    },
    // Lookup subscription pricings
    {
      $lookup: {
        from: 'subscriptionpricings',
        localField: 'subscriptionPricings',
        foreignField: '_id',
        as: 'subscriptionPricings',
      },
    },
    // Unwind pricing to join plan & duration
    {
      $unwind: {
        path: '$subscriptionPricings',
        preserveNullAndEmptyArrays: true,
      },
    },
    // Lookup plan
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPricings.subscriptionPlanId',
        foreignField: '_id',
        as: 'plan',
      },
    },
    // Unwind plan to flatten the data structure for easier access to plan details
    { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
    // Lookup duration
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionPricings.subscriptionDurationId',
        foreignField: '_id',
        as: 'duration',
      },
    },
    { $unwind: { path: '$duration', preserveNullAndEmptyArrays: true } },
    // Reshape pricing
    {
      $addFields: {
        pricingFormatted: {
          subscriptionPlan: '$plan.name',
          subscriptionDuration: '$duration.durationInDays',
        },
      },
    },
    // Group back
    {
      $group: {
        _id: '$_id',
        code: { $first: '$code' },
        discountType: { $first: '$discountType' },
        discountValue: { $first: '$discountValue' },
        isActive: { $first: '$isActive' },
        users: { $first: '$users' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        subscriptionPricings: { $push: '$pricingFormatted' },
      },
    },
  ];

  const result = await SubscriptionCoupon.aggregate(aggregationPipeline);

  return result[0] || null;
};

/**
 * Service function to retrieve multiple subscription-coupon based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering subscription-coupon.
 * @returns {Promise<Partial<ISubscriptionCoupon>[]>} - The retrieved subscription-coupon
 */
const getManySubscriptionCoupon = async (
  query: SearchQueryInput
): Promise<{
  subscriptionCoupons: Partial<ISubscriptionCoupon>[];
  totalData: number;
  totalPages: number;
}> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Calculate the number of items to skip based on the current page and items per page
  const skipItems = (pageNo - 1) * showPerPage;
  // Build the match stage for the aggregation pipeline based on the presence of a search key
  const matchStage = searchKey
    ? {
        $match: {
          code: { $regex: searchKey, $options: 'i' },
        },
      }
    : { $match: {} };
  // Construct the aggregation pipeline to retrieve subscription-coupons with related data and pagination
  const aggregationPipeline: mongoose.PipelineStage[] = [
    matchStage,
    // Lookup users
    {
      $lookup: {
        from: 'users',
        localField: 'users',
        foreignField: '_id',
        as: 'users',
      },
    },
    // Lookup subscription pricings
    {
      $lookup: {
        from: 'subscriptionpricings',
        localField: 'subscriptionPricings',
        foreignField: '_id',
        as: 'subscriptionPricings',
      },
    },
    // Unwind pricing to join plan & duration
    {
      $unwind: {
        path: '$subscriptionPricings',
        preserveNullAndEmptyArrays: true,
      },
    },
    // Lookup plan
    {
      $lookup: {
        from: 'subscriptionplans',
        localField: 'subscriptionPricings.subscriptionPlanId',
        foreignField: '_id',
        as: 'plan',
      },
    },
    { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
    // Lookup duration
    {
      $lookup: {
        from: 'subscriptiondurations',
        localField: 'subscriptionPricings.subscriptionDurationId',
        foreignField: '_id',
        as: 'duration',
      },
    },
    { $unwind: { path: '$duration', preserveNullAndEmptyArrays: true } },
    // Reshape pricing
    {
      $addFields: {
        pricingFormatted: {
          subscriptionPlan: '$plan.name',
          subscriptionDuration: '$duration.durationInDays',
        },
      },
    },
    // Group back because of unwind
    {
      $group: {
        _id: '$_id',
        code: { $first: '$code' },
        discountType: { $first: '$discountType' },
        discountValue: { $first: '$discountValue' },
        isActive: { $first: '$isActive' },
        users: { $first: '$users' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        subscriptionPricings: { $push: '$pricingFormatted' },
      },
    },
    // Sort by creation date in descending order
    { $sort: { createdAt: -1 } },
    // Facet for pagination and total count
    {
      $facet: {
        data: [{ $skip: skipItems }, { $limit: showPerPage }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];
  // Execute the aggregation pipeline
  const result = await SubscriptionCoupon.aggregate(aggregationPipeline);
  // Extract the subscription-coupons, total data count, and total pages from the aggregation result
  const subscriptionCoupons = result[0].data;
  const totalData = result[0].totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalData / showPerPage);

  return { subscriptionCoupons, totalData, totalPages };
};

export const subscriptionCouponServices = {
  createSubscriptionCoupon,
  updateSubscriptionCoupon,
  deleteSubscriptionCoupon,
  getSubscriptionCouponById,
  getManySubscriptionCoupon,
};
