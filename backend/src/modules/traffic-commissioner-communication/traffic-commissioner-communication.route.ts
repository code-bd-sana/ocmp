// Import Router from express
import { Router, Response, NextFunction } from 'express';

// Import controller from corresponding module
import {
  updateTrafficCommissionerCommunication,
  deleteTrafficCommissionerCommunication,
  getTrafficCommissionerCommunicationById,
  getManyTrafficCommissionerCommunication,
  createCommunicationAsStandAlone,
  createCommunicationAsTransportManager,
} from './traffic-commissioner-communication.controller';

//Import validation from corresponding module
import {
  validateCreateTrafficCommissionerCommunicationAsStandAlone,
  validateCreateTrafficCommissionerCommunicationAsTransportManager,
  validateSearchTrafficCommissionerCommunicationQueries,
  validateTrafficCommissionerCommunicationAndManagerIdParam,
  validateTrafficCommissionerCommunicationIdParam,
  validateUpdateTrafficCommissionerCommunication,
} from './traffic-commissioner-communication.validation';
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';
import ServerResponse from '../../helpers/responses/custom-response';

// TODO: have to check subscription middleware in create update & delete routes

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/traffic-commissioner-communication/create-traffic-commissioner-communication
 * @description Create a new traffic-commissioner-communication as a transport manager
 * @access Public
 * @param {function} validation - ['validateCreateTrafficCommissionerCommunicationAsTransportManager']
 * @param {function} controller - ['createCommunicationAsTransportManager']
 */
router.post(
  '/create-traffic-commissioner-communication',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateTrafficCommissionerCommunicationAsTransportManager,
  validateClientForManagerMiddleware,
  createCommunicationAsTransportManager
);

/**
 * @route POST /api/v1/traffic-commissioner-communication/create-traffic-commissioner-communication-standalone
 * @description Create a new traffic-commissioner-communication as a stand-alone user
 * @access Public - Stand-alone user only
 * @param {function} validation - ['validateCreateTrafficCommissionerCommunicationAsStandAlone']
 * @param {function} controller - ['createCommunicationAsStandAlone']
 */
router.post(
  '/create-stand-alone-traffic-commissioner-communication',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateTrafficCommissionerCommunicationAsStandAlone,
  createCommunicationAsStandAlone
);

router.post(
  '/create-traffic-commissioner-communication-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateTrafficCommissionerCommunicationAsStandAlone,
  createCommunicationAsStandAlone
);

/**
 * @route PUT /api/v1/traffic-commissioner-communication/update-traffic-commissioner-communication/:id/:standAloneId
 * @description Update traffic-commissioner-communication information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to update
 * @param {function} validation - ['validateId', 'validateUpdateTrafficCommissionerCommunication']
 * @param {function} controller - ['updateTrafficCommissionerCommunication']
 */
router.patch(
  '/update-traffic-commissioner-communication/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTrafficCommissionerCommunicationAndManagerIdParam,
  validateUpdateTrafficCommissionerCommunication,
  updateTrafficCommissionerCommunication
);

/**
 * @route PATCH /api/v1/traffic-commissioner-communication/update-traffic-commissioner-communication/:id
 * @description Update traffic-commissioner-communication information for stand-alone user
 * @access Public - Stand-alone user only
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to update
 * @param {function} validation - ['validateId', 'validateUpdateTrafficCommissionerCommunication']
 * @param {function} controller - ['updateTrafficCommissionerCommunication']
 */
router.patch(
  '/update-traffic-commissioner-communication/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTrafficCommissionerCommunicationIdParam,
  validateUpdateTrafficCommissionerCommunication,
  updateTrafficCommissionerCommunication
);

/**
 * @route DELETE /api/v1/traffic-commissioner-communication/delete-traffic-commissioner-communication/:id/:standAloneId
 * @description Delete a traffic-commissioner-communication
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTrafficCommissionerCommunication']
 */
router.delete(
  '/delete-traffic-commissioner-communication/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTrafficCommissionerCommunicationAndManagerIdParam,
  deleteTrafficCommissionerCommunication
);

/**
 * @route DELETE /api/v1/traffic-commissioner-communication/delete-traffic-commissioner-communication/:id
 * @description Delete a traffic-commissioner-communication for stand-alone user
 * @access Public - Stand-alone user only
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTrafficCommissionerCommunication']
 */
router.delete(
  '/delete-traffic-commissioner-communication/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTrafficCommissionerCommunicationIdParam,
  deleteTrafficCommissionerCommunication
);

/**
 * @route GET /api/v1/traffic-commissioner-communication/get-traffic-commissioner-communication/many
 * @description Get multiple traffic-commissioner-communications
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTrafficCommissionerCommunication']
 */
router.get(
  '/get-traffic-commissioner-communication/many',
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchTrafficCommissionerCommunicationQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyTrafficCommissionerCommunication
);

/**
 * @route GET /api/v1/traffic-commissioner-communication/get-traffic-commissioner-communication/:id/:standAloneId
 * @description Get a traffic-commissioner-communication by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTrafficCommissionerCommunicationById']
 */
router.get(
  '/get-traffic-commissioner-communication/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTrafficCommissionerCommunicationAndManagerIdParam,
  getTrafficCommissionerCommunicationById
);

/**
 * @route GET /api/v1/traffic-commissioner-communication/get-traffic-commissioner-communication/:id
 * @description Get a traffic-commissioner-communication by ID for stand-alone user
 * @access Public - Stand-alone user only
 * @param {IdOrIdsInput['id']} id - The ID of the traffic-commissioner-communication to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTrafficCommissionerCommunicationById']
 */
router.get(
  '/get-traffic-commissioner-communication/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTrafficCommissionerCommunicationIdParam,
  getTrafficCommissionerCommunicationById
);

// Export the router
module.exports = router;

