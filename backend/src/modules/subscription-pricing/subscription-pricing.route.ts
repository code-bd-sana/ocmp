import { Router } from 'express';

import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  createSubscriptionPricing,
  deleteSubscriptionPricing,
  getPricingByPlan,
  updateSubscriptionPricing,
} from './subscription-pricing.controller';
import {
  validateCreateSubscriptionPricing,
  validateUpdateSubscriptionPricing,
} from './subscription-pricing.validation';

const router = Router();

/**
 * @route POST /api/subscription-pricing
 * @description Create a new subscription pricing
 * @access Private
 */
router.post(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateCreateSubscriptionPricing,
  createSubscriptionPricing
);

/**
 * @route GET /api/subscription-pricing/:planId
 * @description Get subscription pricing by plan ID
 * @access Public
 */
router.get('/:planId', getPricingByPlan);

/**
 * @route PUT /api/subscription-pricing/:id
 * @description Update subscription pricing
 * @access Private
 */
router.put(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateUpdateSubscriptionPricing,
  updateSubscriptionPricing
);

/**
 * @route DELETE /api/subscription-pricing/:id
 * @description Delete a subscription pricing by ID
 * @access Private
 */
router.delete(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  deleteSubscriptionPricing
);

// Export the router
module.exports = router;
