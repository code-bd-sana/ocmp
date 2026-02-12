// Import Router from express
import { Router } from 'express';

//Import validation from corresponding module
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { getSubscriptionRemainingDaysController } from './subscription-remain.controller';

// Initialize router
const router = Router();

/**
 * @route GET /api/v1/subscription-remain/remaining
 * @description Get remaining subscription days for authenticated user
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER, STANDALONE_USER)
 * @param {function} controller - ['getSubscriptionRemainingDaysController']
 */
router.get(
  '/remaining',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  getSubscriptionRemainingDaysController
);

// Export the router
module.exports = router;
