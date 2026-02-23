// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createVehicleAsStandAlone,
  createVehicleAsTransportManager,
  deleteVehicle,
  getManyVehicle,
  getVehicleById,
} from './vehicle.controller';

//Import validation from corresponding module
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import {
  validateCreateVehicleAsStandAlone,
  validateCreateVehicleAsTransportManager,
  validateUpdateVehicle,
  validateUpdateVehicleIds,
} from './vehicle.validation';

// TODO: have to check subscription middleware in create update & delete routes

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/vehicle/create-vehicle
 * @description Create a new vehicle as a transport manager
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateCreateVehicle']
 * @param {function} controller - ['createVehicle']
 */
router.post(
  '/create-vehicle',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateVehicleAsTransportManager,
  validateClientForManagerMiddleware,
  createVehicleAsTransportManager
);

// Define route handlers
/**
 * @route POST /api/v1/vehicle/create-stand-alone-vehicle
 * @description Create a new stand-alone vehicle
 * @access Private (Standalone User)
 * @param {function} validation - ['validateCreateVehicle']
 * @param {function} controller - ['createVehicle']
 */
router.post(
  '/create-stand-alone-vehicle',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateCreateVehicleAsStandAlone,
  createVehicleAsStandAlone
);

router.patch(
  '/update-vehicle/:vehicleId/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientForManagerMiddleware,
  validateUpdateVehicleIds,
  validateUpdateVehicle
);

/**
 * @route DELETE /api/v1/vehicle/delete-vehicle/:id
 * @description Delete a vehicle
 * @access Private (Transport Manager or Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteVehicle']
 */
router.delete(
  '/delete-vehicle/:id',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateId,
  deleteVehicle
);

/**
 * @route GET /api/v1/vehicle/get-vehicle/many
 * @description Get multiple vehicles
 * @access Private (Transport Manager or Standalone User)
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyVehicle']
 */
router.get('/get-vehicle/many', validateSearchQueries, getManyVehicle);

/**
 * @route GET /api/v1/vehicle/get-vehicle/:id
 * @description Get a vehicle by ID
 * @access Private (Transport Manager or Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the vehicle to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getVehicleById']
 */
router.get(
  '/get-vehicle/:id',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  validateId,
  getVehicleById
);

// Export the router
module.exports = router;
