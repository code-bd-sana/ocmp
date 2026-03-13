// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createFuelUsageAsManager,
  createFuelUsageAsStandAlone,
  updateFuelUsage,
  deleteFuelUsage,
  getFuelUsageById,
  getManyFuelUsage,
} from './fuel-usage.controller';

//Import validation from corresponding module
import {
  validateCreateFuelUsageAsManager,
  validateCreateFuelUsageAsStandAlone,
  validateUpdateFuelUsage,
  validateSearchFuelUsage,
} from './fuel-usage.validation';
import { validateId } from '../../handlers/common-zod-validator';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers

/**
 * @route POST /api/v1/fuel-usage/create-fuel-usage
 * @description Create a new fuel-usage
 * @access Public
 * @param {function} validation - ['validateCreateFuelUsage']
 * @param {function} controller - ['createFuelUsage']
 */
router.post(
  '/create-fuel-usage',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateFuelUsageAsManager,
  validateClientForManagerMiddleware,
  createFuelUsageAsManager
);

/**
 * @route POST /api/v1/fuel-usage/create-stand-alone-fuel-usage
 * @description Create a new standalone fuel-usage as a Standalone User
 * @access Public
 * @param {function} validation - ['validateCreateFuelUsage']
 * @param {function} controller - ['createFuelUsage']
 */
router.post(
  '/create-stand-alone-fuel-usage',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateFuelUsageAsStandAlone,
  createFuelUsageAsStandAlone
);

/**
 * @route PUT /api/v1/fuel-usage/update-fuel-usage/:id
 * @description Update fuel-usage information as Transport Manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to update
 * @param {function} validation - ['validateId', 'validateUpdateFuelUsage']
 * @param {function} controller - ['updateFuelUsage']
 */
router.put('/update-fuel-usage/:id', validateId, validateUpdateFuelUsage, updateFuelUsage);

/**
 * @route DELETE /api/v1/fuel-usage/delete-fuel-usage/:id
 * @description Delete a fuel-usage
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteFuelUsage']
 */
router.delete('/delete-fuel-usage/:id', validateId, deleteFuelUsage);

/**
 * @route GET /api/v1/fuel-usage/get-fuel-usages
 * @description Get all fuel-usage records (paginated + searchable)
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyFuelUsage']
 */
router.get(
  '/get-fuel-usages',
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    // Use module-specific search validator that accepts `standAloneId`
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchFuelUsage(req, res, next);
    }
    return validateSearchFuelUsage(req, res, next);
  },
  getManyFuelUsage
);

/**
 * @route GET /api/v1/fuel-usage/get-fuel-usage/:id
 * @description Get a fuel-usage by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the fuel-usage to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getFuelUsageById']
 */
router.get('/get-fuel-usage/:id', validateId, getFuelUsageById);

// Export the router
module.exports = router;

