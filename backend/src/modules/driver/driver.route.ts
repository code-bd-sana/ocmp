import { validateSearchQueries } from './../../handlers/common-zod-validator';
// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createDriverAsStandAlone,
  createDriverAsTransportManager,
  deleteDriver,
  getDriverById,
  getManyDriver,
  updateDriver,
} from './driver.controller';

//Import validation from corresponding module
import { validateId } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateDriverAsStandAlone,
  validateCreateDriverAsTransportManager,
  validateDeleteDriverIds,
  validateGetDriverByIdParams,
  validateSearchDriverQueries,
  validateUpdateDriver,
  validateUpdateDriverIds,
} from './driver.validation';

// TODO: have to check subscription middleware in create update & delete routes

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/driver/create-driver
 * @description Create a new driver as a transport manager
 * @access Private - Transport Manager only
 * @param {function} validation - ['validateCreateDriverAsTransportManager']
 * @param {function} controller - ['createDriverAsTransportManager']
 */
router.post(
  '/create-driver',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateCreateDriverAsTransportManager,
  createDriverAsTransportManager
);

/**
 * @route POST /api/v1/driver/create-stand-alone-driver
 * @description Create a new driver as a stand-alone user
 * @access Private - Stand-alone user only
 * @param {function} validation - ['validateCreateDriverAsStandAlone']
 * @param {function} controller - ['createDriverAsStandAlone']
 */
router.post(
  '/create-stand-alone-driver',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateDriverAsStandAlone,
  createDriverAsStandAlone
);

/**
 * @route PUT /api/v1/driver/update-driver/:driverId/:standAloneId
 * @description Update driver information as a transport manager
 * @access Private - Transport Manager only
 * @param {IdOrIdsInput['id']} id - The ID of the driver to update
 * @param {function} validation - ['validateId', 'validateUpdateDriver']
 * @param {function} controller - ['updateDriver']
 */
router.patch(
  '/update-driver-by-manager/:driverId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateUpdateDriverIds,
  validateUpdateDriver,
  updateDriver
);

/**
 * @route PUT /api/v1/driver/update-driver/:id
 * @description Update driver information as a stand-alone user
 * @access Private - Stand-alone user only (can update their own drivers)
 * @param {IdOrIdsInput['id']} id - The ID of the driver to update
 * @param {function} validation - ['validateId', 'validateUpdateDriver']
 * @param {function} controller - ['updateDriver']
 */
router.patch(
  '/update-driver/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateDriver,
  updateDriver
);

/**
 * @route DELETE /api/v1/driver/delete-driver/:id
 * @description Delete a driver
 * @access Private - Transport Manager only (can delete drivers they created) and Stand-alone user only (can delete their own drivers)
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteDriver']
 */
router.delete(
  '/delete-driver-by-manager/:driverId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateDeleteDriverIds,
  deleteDriver
);

/**
 * @route DELETE /api/v1/driver/delete-driver/:id
 * @description Delete a driver
 * @access Private - Stand-alone user only
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteDriver']
 */
router.delete(
  '/delete-driver/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  deleteDriver
);

/**
 * @route GET /api/v1/driver/get-drivers
 * @description Get multiple drivers
 * @access Private
 * @param {function} validation - ['validateSearchDriverQueries']
 * @param {function} controller - ['getManyDriver']
 */
router.get(
  '/get-drivers',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    // For transport managers, ensure they can only access drivers of their approved clients
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    // Validate query based on role
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchDriverQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyDriver
);

/**
 * @route GET /api/v1/driver/get-driver/:id/:standAloneId
 * @route GET /api/v1/driver/get-driver/:id
 * @description Get a driver by ID
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the driver to retrieve
 * @param {function} validation - ['validateGetDriverByIdParams']
 * @param {function} controller - ['getDriverById']
 */
router.get(
  '/get-driver/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateGetDriverByIdParams,
  getDriverById
);

/**
 * @route GET /api/v1/driver/get-driver/:id
 * @description Get a driver as stand alone user by ID
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the driver to retrieve
 */

router.get(
  '/get-driver/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateGetDriverByIdParams,
  getDriverById
);

// Export the router
module.exports = router;
