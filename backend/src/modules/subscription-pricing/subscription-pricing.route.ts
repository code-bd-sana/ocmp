// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSubscriptionPricing,
  deleteManySubscriptionPricing,
  deleteSubscriptionPricing,
  getManySubscriptionPricing,
  getSubscriptionPricingById,
  updateSubscriptionPricing,
} from './subscription-pricing.controller';

//Import validation from corresponding module
import {
  validateId,
  validateIds,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  validateCreateSubscriptionPricing,
  validateUpdateSubscriptionPricing,
} from './subscription-pricing.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-pricing/create-subscription-pricing
 * @description Create a new subscription-pricing
 * @access Private
 * @param {function} validation - ['validateCreateSubscriptionPricing']
 * @param {function} controller - ['createSubscriptionPricing']
 */
router.post(
  '/',
  validateCreateSubscriptionPricing,
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  createSubscriptionPricing
);

/**
 * @route PUT /api/v1/subscription-pricing/update-subscription-pricing/:id
 * @description Update subscription-pricing information
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionPricing']
 * @param {function} controller - ['updateSubscriptionPricing']
 */
router.patch(
  '/:id',
  validateId,
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateUpdateSubscriptionPricing,
  updateSubscriptionPricing
);

/**
 * @route DELETE /api/v1/subscription-pricing/delete-subscription-pricing/many
 * @description Delete multiple subscription-pricing(s)
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionPricing']
 */
router.delete(
  '/many',
  validateIds,
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  deleteManySubscriptionPricing
);

/**
 * @route DELETE /api/v1/subscription-pricing/delete-subscription-pricing/:id
 * @description Delete a subscription-pricing
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionPricing']
 */
router.delete(
  '/:id',
  validateId,
  isAuthorized,
  authorizedRoles([UserRole.SUPER_ADMIN]),
  deleteSubscriptionPricing
);

/**
 * @route GET /api/v1/subscription-pricing/get-subscription-pricing/many
 * @description Get multiple subscription-pricing(s)
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubscriptionPricing']
 */
router.get('/', validateSearchQueries, getManySubscriptionPricing);

/**
 * @route GET /api/v1/subscription-pricing/get-subscription-pricing/:id
 * @description Get a subscription-pricing by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubscriptionPricingById']
 */
router.get('/:id', validateId, getSubscriptionPricingById);

// Export the router
module.exports = router;
