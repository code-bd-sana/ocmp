// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  updateSelfService,
  deleteSelfService,
  getSelfServiceById,
  getManySelfService,
  createSelfServiceAsManager,
  createSelfServiceAsStandAlone,
} from './self-service.controller';

//Import validation from corresponding module
import {
  validateCreateSelfServiceAsManager,
  validateCreateSelfServiceAsStandAlone,
  validateUpdateSelfService,
} from './self-service.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * Create self service as manager
 *
 * @route POST /api/v1/self-service/create-self-service
 * @description Create a new self-service as Transport Manager
 * @access Public
 * @param {function} validation - ['validateCreateSelfService']
 * @param {function} controller - ['createSelfService']
 */
router.post(
  '/create-self-service',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateSelfServiceAsManager,
  validateClientForManagerMiddleware,
  createSelfServiceAsManager
);

/**
 * Create self service as stand alone user
 *
 * @route POST /api/v1/self-service/create-stand-alone-self-service
 * @description Create a new self-service as Standalone User
 * @access Public
 * @param {function} validation - ['validateCreateSelfServiceAsStandAlone']
 * @param {function} controller - ['createSelfService']
 */
router.post(
  '/create-stand-alone-self-service',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateSelfServiceAsStandAlone,
  createSelfServiceAsStandAlone
);

/**
 * @route PUT /api/v1/self-service/update-self-service/:id
 * @description Update self-service information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to update
 * @param {function} validation - ['validateId', 'validateUpdateSelfService']
 * @param {function} controller - ['updateSelfService']
 */
router.put('/update-self-service/:id', validateId, validateUpdateSelfService, updateSelfService);

/**
 * @route DELETE /api/v1/self-service/delete-self-service/:id
 * @description Delete a self-service
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSelfService']
 */
router.delete('/delete-self-service/:id', validateId, deleteSelfService);

/**
 * @route GET /api/v1/self-service/get-self-service/many
 * @description Get multiple self-services
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySelfService']
 */
router.get('/get-self-service/many', validateSearchQueries, getManySelfService);

/**
 * @route GET /api/v1/self-service/get-self-service/:id/:standAloneId
 * @description Get a self-service by ID as Transport Manager
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSelfServiceById']
 */
router.get('/get-self-service/:id/:standAloneId', validateId, getSelfServiceById);

/**
 * @route GET /api/v1/self-service/get-self-service/:id
 * @description Get a self-service by ID as Standalone User
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the self-service to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSelfServiceById']
 */
router.get('/get-self-service/:id', validateId, getSelfServiceById);

// Export the router
module.exports = router;

