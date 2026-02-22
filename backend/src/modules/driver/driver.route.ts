// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  updateDriver,
  deleteDriver,
  getDriverById,
  getManyDriver,
  createDriverAsTransportManager,
  createDriverAsStandAlone,
} from './driver.controller';

//Import validation from corresponding module
import {
  validateCreateDriverAsTransportManager,
  validateCreateDriverAsStandAlone,
  validateUpdateDriver,
  validateSearchDriverQueries,
  validateUpdateDriverIds,
  validateDeleteDriverIds,
} from './driver.validation';
import { validateId } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';

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
  validateCreateDriverAsTransportManager,
  validateClientForManagerMiddleware,
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
  validateClientForManagerMiddleware,
  validateUpdateDriverIds,
  validateUpdateDriver,
  updateDriver
);

/**
 * @route PUT /api/v1/driver/update-driver/:id
 * @description Update driver information as a stand-alone user
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the driver to update
 * @param {function} validation - ['validateId', 'validateUpdateDriver']
 * @param {function} controller - ['updateDriver']
 */
router.patch(
  '/update-driver/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateId,
  validateUpdateDriver,
  updateDriver
);

/**
 * @route DELETE /api/v1/driver/delete-driver/:id
 * @description Delete a driver
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteDriver']
 */
router.delete(
  '/delete-driver-by-manager/:driverId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateDeleteDriverIds,
  validateClientForManagerMiddleware,
  deleteDriver
);

/**
 * @route DELETE /api/v1/driver/delete-driver/:id
 * @description Delete a driver
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the driver to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteDriver']
 */
router.delete(
  '/delete-driver/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateId,
  deleteDriver
);

/**
 * @route GET /api/v1/driver/get-drivers
 * @description Get multiple drivers
 * @access Public
 * @param {function} validation - ['validateSearchDriverQueries']
 * @param {function} controller - ['getManyDriver']
 */
router.get('/get-drivers', validateSearchDriverQueries, getManyDriver);

/**
 * @route GET /api/v1/driver/get-driver/:id
 * @description Get a driver by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the driver to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getDriverById']
 */
router.get('/get-driver/:id', validateId, getDriverById);

// Export the router
module.exports = router;

