// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  updateMaintenanceProviderCommunication,
  deleteMaintenanceProviderCommunication,
  getMaintenanceProviderCommunicationById,
  createMaintenanceProviderCommunicationAsManager,
  createMaintenanceProviderCommunicationAsStandalone,
  getAllMaintenanceProviderCommunication,
} from './maintenance-provider-communication.controller';

//Import validation from corresponding module
import {
  validateCreateMaintenanceProviderCommunicationAsManager,
  validateCreateMaintenanceProviderCommunicationAsStandalone,
  validateDeleteMaintenanceProviderCommunicationIds,
  validateGetMaintenanceProviderCommunicationByIdParams,
  validateUpdateMaintenanceProviderCommunication,
  validateUpdateMaintenanceProviderCommunicationIds,
} from './maintenance-provider-communication.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateSearchMeetingNoteQueries } from '../meeting-note/meeting-note.validation';
import ServerResponse from '../../helpers/responses/custom-response';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/maintenance-provider-communication/create-as-manager
 * @description Create a new maintenance-provider-communication as manager
 * @access protected (Transport Manager)
 * @param {function} validation - ['validateCreateMaintenanceProviderCommunicationAsManager']
 * @param {function} controller - ['createMaintenanceProviderCommunicationAsManager']
 */
router.post(
  '/create-as-manager',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateMaintenanceProviderCommunicationAsManager,
  validateClientForManagerMiddleware,
  createMaintenanceProviderCommunicationAsManager
);

/**
 * @route POST /api/v1/maintenance-provider-communication/create-as-standalone
 * @description Create a new maintenance-provider-communication as standalone user
 * @access protected (Stand Alone User)
 * @param {function} validation - ['validateCreateMaintenanceProviderCommunicationAsStandalone']
 * @param {function} controller - ['createMaintenanceProviderCommunicationAsStandalone']
 */
router.post(
  '/create-as-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateMaintenanceProviderCommunicationAsStandalone,
  createMaintenanceProviderCommunicationAsStandalone
);

/*****************************************/
/*************UPDATE DATA*****************/
/*****************************************/
/**
 * @route PATCH /api/v1/maintenance-provider-communication/:id/:standAloneId
 * @description Update a maintenance-provider-communication by ID (Transport Manager can only update maintenance-provider-communications of their approved clients)
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateUpdateMaintenanceProviderCommunicationIds', 'validateUpdateMaintenanceProviderCommunication']
 * @param {function} controller - ['updateMaintenanceProviderCommunication']
 */

router.patch(
  '/update-as-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateUpdateMaintenanceProviderCommunicationIds,
  validateUpdateMaintenanceProviderCommunication,
  updateMaintenanceProviderCommunication
);

/**
 * @route PATCH /api/v1/maintenance-provider-communication/update-as-standalone/:id
 * @description Update a maintenance-provider-communication by ID (Standalone User)
 * @access Private (Standalone User)
 * @param {function} validation - ['validateId', 'validateUpdateMaintenanceProviderCommunication']
 * @param {function} controller - ['updateMaintenanceProviderCommunication']
 */
router.patch(
  '/update-as-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateMaintenanceProviderCommunication,
  updateMaintenanceProviderCommunication
);
/*****************************************/
/*************DELETE DATA*****************/
/*****************************************/
/**
 * @route DELETE /api/v1/maintenance-provider-communication/:id/:standAloneId
 * @description Delete a maintenance-provider-communication by ID (Transport Manager can only delete maintenance-provider-communications of their approved clients)
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteMaintenanceProviderCommunication']
 **/
router.delete(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateDeleteMaintenanceProviderCommunicationIds,
  deleteMaintenanceProviderCommunication
);

/**
 * @route DELETE /api/v1/maintenance-provider-communication/:id
 * @description Delete a maintenance-provider-communication by ID (Standalone User can only delete maintenance-provider-communications of their approved clients)
 * @access Private (Standalone User)
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteMaintenanceProviderCommunication']
 **/
router.delete(
  '/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateId,
  deleteMaintenanceProviderCommunication
);

/**
 * @route GET /api/v1/maintenance-provider-communication/get-all
 * @description Get multiple maintenance-provider-communications
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyMaintenanceProviderCommunication']
 */
router.get(
  '/get-all',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.STANDALONE_USER && req.query?.standAloneId) {
      return ServerResponse(
        res,
        false,
        403,
        'Forbidden: standAloneId is only allowed for transport managers'
      );
    }
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateClientForManagerMiddleware(req, res, next);
    }
    next();
  },
  (req: AuthenticatedRequest, res, next) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchMeetingNoteQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getAllMaintenanceProviderCommunication
);

/**
 * @route GET /api/v1/maintenance-provider-communication/:id/:standAloneId
 * @description Get a maintenance-provider-communication by ID
 * @access private (Transport Manager)
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getMaintenanceProviderCommunicationById']
 **/
router.get(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateGetMaintenanceProviderCommunicationByIdParams,
  getMaintenanceProviderCommunicationById
);

/**
 * @route GET /api/v1/maintenance-provider-communication/:id
 * @description Get a maintenance-provider-communication by ID
 * @access private (Standalone User)
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getMaintenanceProviderCommunicationById']
 **/
router.get(
  '/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateGetMaintenanceProviderCommunicationByIdParams,
  getMaintenanceProviderCommunicationById
);

// Export the router
module.exports = router;

