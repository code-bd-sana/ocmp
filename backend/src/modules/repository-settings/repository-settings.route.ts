// Import Router from express
import { Router } from 'express';

// Import controllers from corresponding module
import {
  getRepositorySettings,
  updateRepositorySettings,
} from './repository-settings.controller';

// Import validators
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { validateUpdateRepositorySettings } from './repository-settings.validation';

// Initialize router
const router = Router();

// Define route handlers

/**
 * @route GET /api/v1/repository-settings
 * @description Get repository settings for the authenticated user (all 21 boolean flags)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER, STANDALONE_USER)
 * @param {function} controller - ['getRepositorySettings']
 */
router.get(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  getRepositorySettings
);

/**
 * @route PATCH /api/v1/repository-settings
 * @description Update repository settings for the authenticated user (partial boolean flags)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER, STANDALONE_USER)
 * @param {function} validation - ['validateUpdateRepositorySettings']
 * @param {function} controller - ['updateRepositorySettings']
 */
router.patch(
  '/',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  validateUpdateRepositorySettings,
  updateRepositorySettings
);

// Export the router
module.exports = router;