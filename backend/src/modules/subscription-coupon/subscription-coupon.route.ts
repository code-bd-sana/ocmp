// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionCoupon,
  deleteSubscriptionCoupon,
  getManySubscriptionCoupon,
  getSubscriptionCouponById,
  updateSubscriptionCoupon,
} from './subscription-coupon.controller';

//Import validation from corresponding module
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import {
  validateCreateSubscriptionCoupon,
  validateUpdateSubscriptionCoupon,
} from './subscription-coupon.validation';

// Initialize router
const router = Router();

router.use(isAuthorized);

// Define route handlers
/**
 * @route POST /api/v1/subscription-coupon
 * @description Create a new subscription-coupon
 * @access Public
 * @param {function} validation - ['validateCreateSubscriptionCoupon']
 * @param {function} controller - ['createSubscriptionCoupon']
 */
router.post('/', validateCreateSubscriptionCoupon, createSubscriptionCoupon);

/**
 * @route PATCH /api/v1/subscription-coupon/:id
 * @description Update subscription-coupon information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionCoupon']
 * @param {function} controller - ['updateSubscriptionCoupon']
 */
router.patch('/:id', validateId, validateUpdateSubscriptionCoupon, updateSubscriptionCoupon);

/**
 * @route DELETE /api/v1/subscription-coupon/:id
 * @description Delete a subscription-coupon
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionCoupon']
 */
router.delete('/:id', validateId, deleteSubscriptionCoupon);

/**
 * @route GET /api/v1/subscription-coupon/many
 * @description Get multiple subscription-coupons
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionCoupon']
 */
router.get('/many', validateSearchQueries, getManySubscriptionCoupon);

/**
 * @route GET /api/v1/subscription-coupon/:id
 * @description Get a subscription-coupon by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-coupon to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionCouponById']
 */
router.get('/:id', validateId, getSubscriptionCouponById);

// Export the router
module.exports = router;

