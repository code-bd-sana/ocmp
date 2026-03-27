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
  getDriversWithVehicles,
} from './fuel-usage.controller';

//Import validation from corresponding module
import {
  validateCreateFuelUsageAsManager,
  validateCreateFuelUsageAsStandAlone,
  validateUpdateFuelUsage,
  validateSearchFuelUsage,
  validateFuelUsageIdParam,
  validateFuelUsageAndManagerIdParam,
} from './fuel-usage.validation';
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import ServerResponse from '../../helpers/responses/custom-response';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers

/**
 * @route POST /api/v1/fuel-usage/create-fuel-usage
 * @description Create a new fuel-usage as a Transport Manager
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
 * @route PATCH /api/v1/fuel-usage/update-fuel-usage/:id/:standAloneId
 * @description Update a fuel-usage by ID as a Transport Manager
 * @access Private (Transport Manager)
 */
router.patch(
  '/update-fuel-usage/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateFuelUsageAndManagerIdParam,
  validateUpdateFuelUsage,
  updateFuelUsage
);

/**
 * @route PATCH /api/v1/fuel-usage/update-fuel-usage/:id
 * @description Update a fuel-usage by ID as a Standalone User
 * @access Private (Standalone User)
 */

router.patch(
  '/update-fuel-usage/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateFuelUsageIdParam,
  validateUpdateFuelUsage,
  updateFuelUsage
);

/**
 * @route DELETE /api/v1/fuel-usage/delete-fuel-usage/:id/:standAloneId
 * @description Delete a fuel-usage by ID as a Transport Manager
 * @access Private (Transport Manager)
 */
router.delete(
  '/delete-fuel-usage/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateFuelUsageAndManagerIdParam,
  deleteFuelUsage
);

/**
 * @route DELETE /api/v1/fuel-usage/delete-fuel-usage/:id
 * @description Delete a fuel-usage by ID as a Standalone User
 * @access Private (Standalone User)
 */
router.delete(
  '/delete-fuel-usage/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateFuelUsageIdParam,
  deleteFuelUsage
);

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
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(res, false, 400, 'standAloneId is not needed for standalone users');
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      if (!req.query?.standAloneId) {
        return ServerResponse(res, false, 400, 'standAloneId is required for transport managers');
      }
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchFuelUsage(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyFuelUsage
);

/**
 * @route GET /api/v1/fuel-usage/get-fuel-usage/:id/:standAloneId
 * @description Get a fuel-usage by ID (Transport Manager)
 * @access Private (Transport Manager)
 */
router.get(
  '/get-fuel-usage/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateFuelUsageAndManagerIdParam,
  getFuelUsageById
);

/**
 * @route GET /api/v1/fuel-usage/get-fuel-usage/:id
 * @description Get a fuel-usage by ID (Standalone User)
 * @access Private (Standalone User)
 */
router.get(
  '/get-fuel-usage/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateFuelUsageIdParam,
  getFuelUsageById
);

/**
 * @route GET /api/v1/fuel-usage/get-drivers-with-vehicles
 * @description Get all drivers belonging to the standalone user, each with their assigned vehicles
 * @access Transport Manager & Standalone User
 */
router.get(
  '/get-drivers-with-vehicles',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(res, false, 400, 'standAloneId is not needed for standalone users');
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      if (!req.query?.standAloneId) {
        return ServerResponse(res, false, 400, 'standAloneId is required for transport managers');
      }
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  getDriversWithVehicles
);

// Export the router
module.exports = router;
