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
import { validateId, validateIds } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  validateCreateSubscriptionPricing,
  validateSubscriptionPricingSearch,
  validateUpdateSubscriptionPricing,
} from './subscription-pricing.validation';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/subscription-pricing
 * @description Create a new subscription-pricing
 * @access Private
 * @param {function} middleware - ['isAuthorized', 'authorizedRoles']
 * @param {function} validation - ['validateCreateSubscriptionPricing']
 * @param {function} controller - ['createSubscriptionPricing']
 */
router.post(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateCreateSubscriptionPricing,
  createSubscriptionPricing
);

/**
 * @route PUT /api/v1/subscription-pricing/:id
 * @description Update subscription-pricing information
 * @access Private
 * @param {function} middleware - ['isAuthorized', 'authorizedRoles']
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to update
 * @param {function} validation - ['validateId', 'validateUpdateSubscriptionPricing']
 * @param {function} controller - ['updateSubscriptionPricing']
 */
router.patch(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateUpdateSubscriptionPricing,
  updateSubscriptionPricing
);

/**
 * @route GET /api/v1/subscription-pricing/many
 * @description Delete multiple subscription-pricing(s)
 * @access Private
 * @param {function} middleware - ['isAuthorized', 'authorizedRoles']
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubscriptionPricing']
 */
router.get(
  '/many',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateIds,
  deleteManySubscriptionPricing
);

/**
 * @route DELETE /api/v1/subscription-pricing/:id
 * @description Delete a subscription-pricing
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to delete
 * @param {function} middleware - ['isAuthorized', 'authorizedRoles']
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubscriptionPricing']
 */
router.delete(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateId,
  deleteSubscriptionPricing
);

/**
 * @route GET /api/v1/subscription-pricing
 * @description Get multiple subscription-pricing(s)
 * @access Public (with optional authentication)
 * @param {function} middleware - ['isAuthorized', 'validateSubscriptionPricingSearch']
 * @param {function} controller - ['getManySubscriptionPricing']
 */
router.get(
  '/',
  isAuthorized({ isOptional: true }),
  validateSubscriptionPricingSearch,
  getManySubscriptionPricing
);

/**
 * @route GET /api/v1/subscription-pricing/:id
 * @description Get a subscription-pricing by ID
 * @access Public (with optional authentication)
 * @param {IdOrIdsInput['id']} id - The ID of the subscription-pricing to retrieve
 * @param {function} middleware - ['isAuthorized', 'validateId']
 * @param {function} controller - ['getSubscriptionPricingById']
 */
router.get('/:id', isAuthorized({ isOptional: true }), validateId, getSubscriptionPricingById);

// Export the router
module.exports = router;
