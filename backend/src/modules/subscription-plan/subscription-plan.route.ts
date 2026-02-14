import { Router } from 'express';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  createSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllSubscriptionPlans,
  updateSubscriptionPlan,
} from './subscription-plan.controller';
import {
  validateCreateSubscriptionPlan,
  validateUpdateSubscriptionPlan,
} from './subscription-plan.validation';

// Initialize router
const router = Router();

/**
 * @route POST /api/subscription-plan
 * @description Create a new subscription plan (Accessible by Super Admin)
 * @access Private
 */
router.post(
  '/',
  isAuthorized(),
  validateCreateSubscriptionPlan,
  authorizedRoles([UserRole.SUPER_ADMIN]), // Only SUPER_ADMIN can create plans
  createSubscriptionPlan
);

/**
 * @route GET /api/subscription-plan
 * @description Get all active and inactive subscription plans
 * @access Public (All users can view)
 */
router.get('/', isAuthorized(), getAllSubscriptionPlans);

/**
 * @route PATCH /api/subscription-plan/:id
 * @description Update a subscription plan (Accessible by Super Admin)
 * @access Private
 */
router.patch(
  '/:id',
  isAuthorized(),
  validateUpdateSubscriptionPlan,
  authorizedRoles([UserRole.SUPER_ADMIN]), // Only SUPER_ADMIN can update plans
  updateSubscriptionPlan
);

/**
 * @route DELETE /api/subscription-plan/:id
 * @description Delete a subscription plan (Accessible by Super Admin)
 * @access Private
 */
router.delete(
  '/:id',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]), // Only SUPER_ADMIN can delete plans
  deleteSubscriptionPlan
);

// Export the router
module.exports = router;
