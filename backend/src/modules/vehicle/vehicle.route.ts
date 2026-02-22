// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getManyVehicle,
  createVehicleAsTransportManager,
  createVehicleAsStandAlone,
} from './vehicle.controller';

//Import validation from corresponding module
import {
  validateCreateVehicleAsTransportManager,
  validateCreateVehicleAsStandAlone,
} from './vehicle.validation';
import {
  validateId,
  validateIds,
  validateSearchQueries,
} from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/vehicle/create-vehicle
 * @description Create a new vehicle as a transport manager
 * @access Public
 * @param {function} validation - ['validateCreateVehicle']
 * @param {function} controller - ['createVehicle']
 */
router.post(
  '/create-vehicle',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateVehicleAsTransportManager,
  validateClientForManagerMiddleware,
  createVehicleAsTransportManager
);

// Define route handlers
/**
 * @route POST /api/v1/vehicle/create-stand-alone-vehicle
 * @description Create a new stand-alone vehicle
 * @access Public
 * @param {function} validation - ['validateCreateVehicle']
 * @param {function} controller - ['createVehicle']
 */

router.post(
  '/create-stand-alone-vehicle',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateVehicleAsStandAlone,
  createVehicleAsStandAlone
);

/**
 * @route DELETE /api/v1/vehicle/delete-vehicle/:id
 * @description Delete a vehicle
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteVehicle']
 */
router.delete('/delete-vehicle/:id', validateId, deleteVehicle);

/**
 * @route GET /api/v1/vehicle/get-vehicle/many
 * @description Get multiple vehicles
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyVehicle']
 */
router.get('/get-vehicle/many', validateSearchQueries, getManyVehicle);

/**
 * @route GET /api/v1/vehicle/get-vehicle/:id
 * @description Get a vehicle by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getVehicleById']
 */
router.get('/get-vehicle/:id', validateId, getVehicleById);

// Export the router
module.exports = router;

