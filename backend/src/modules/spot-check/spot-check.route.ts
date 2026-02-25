// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  createSpotCheckAsManager,
  createSpotCheckAsStandAlone,
  updateSpotCheck,
  deleteSpotCheck,
  getSpotCheckById,
  getManySpotCheck,
} from './spot-check.controller';

//Import validation from corresponding module
import {
  validateCreateSpotCheckAsManager,
  validateCreateSpotCheckAsStandAlone,
  validateUpdateSpotCheck,
  validateSearchSpotChecksQueries,
} from './spot-check.validation';
import authorizedRoles from '../../middlewares/authorized-roles';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import { validateId } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';

// Initialize router
const router = Router();
router.use(isAuthorized());

//TODO - have to check subscription middleware in create update & delete routes

// Define route handlers
/**
 * @route POST /api/v1/spot-check/create-spot-check
 * @description Create a new spot-check (Transport Manager)
 * @access Private (Transport Manager)
 */
router.post(
  '/create-spot-check',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateSpotCheckAsManager,
  validateClientForManagerMiddleware,
  createSpotCheckAsManager
);

/**
 * @route POST /api/v1/spot-check/create-stand-alone-spot-check
 * @description Create a new spot-check (Standalone User)
 * @access Private (Standalone User)
 */
router.post(
  '/create-stand-alone-spot-check',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateSpotCheckAsStandAlone,
  createSpotCheckAsStandAlone
);

/**
 * @route PATCH /api/v1/spot-check/update-spot-check/:id
 * @description Update spot-check information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to update
 * @param {function} validation - ['validateId', 'validateUpdateSpotCheck']
 * @param {function} controller - ['updateSpotCheck']
 */
router.patch('/update-spot-check/:id', validateId, validateUpdateSpotCheck, updateSpotCheck);

/**
 * @route DELETE /api/v1/spot-check/delete-spot-check/:id
 * @description Delete a spot-check
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSpotCheck']
 */
router.delete('/delete-spot-check/:id', validateId, deleteSpotCheck);

/**
 * @route GET /api/v1/spot-check/get-spot-check/many
 * @description Get multiple spot-checks
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySpotCheck']
 */
router.get('/get-spot-check/many', validateSearchSpotChecksQueries, getManySpotCheck);

/**
 * @route GET /api/v1/spot-check/get-spot-check/:id
 * @description Get a spot-check by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the spot-check to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSpotCheckById']
 */
router.get('/get-spot-check/:id', validateId, getSpotCheckById);

// Export the router
module.exports = router;

