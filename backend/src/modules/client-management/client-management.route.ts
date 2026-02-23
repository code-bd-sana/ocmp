// Import Router from express
import { Router } from 'express';

// Import controllers from corresponding module
import {
  createClient,
  getClientLimit,
  getClientsByManagerId,
  getLeaveRequests,
  getManagerList,
  getPendingRequests,
  getRemoveRequest,
  handleLeaveRequest,
  handleRemoveRequest,
  removeClientFromManager,
  requestJoinTeam,
  requestLeave,
  requestRemove,
  updateClientLimit,
  updateJoinRequest,
} from './client-management.controller';

// Import validators
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import {
  validateAction,
  validateClientIdParam,
  validateCreateClient,
  validateManagerIdParam,
  validateRequestJoinTeam,
  validateUpdateClientLimit,
  validateUpdateJoinRequest,
} from './client-management.validation';

// TODO: have to check subscription middleware in create update & delete routes

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/client-management/clients
 * @description Create client under Transport Manager
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated (Bearer UUID → Redis → JWT)
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validation - ['validateCreateClient']
 * @param {function} controller - ['createClient']
 */
router.post(
  '/clients',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateCreateClient,
  createClient
);

/**
 * @route GET /api/v1/client-management/clients
 * @description Get all clients of the authenticated Transport Manager (uses req.user._id, no param needed)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getClientsByManagerId']
 */
router.get(
  '/clients',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateSearchQueries,
  getClientsByManagerId
);

/**
 * @route GET /api/v1/client-management/transport-manager/:managerId/clients
 * @description Get all clients of a specific Transport Manager (Admin only)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateManagerIdParam', 'validateSearchQueries']
 * @param {function} controller - ['getClientsByManagerId']
 */
router.get(
  '/transport-manager/:managerId/clients',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  validateManagerIdParam,
  validateSearchQueries,
  getClientsByManagerId
);

/**
 * @route POST /api/v1/client-management/request-join-team
 * @description Client requests to join a Transport Manager's team (clientId from token, managerId in body)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} validation - ['validateRequestJoinTeam']
 * @param {function} controller - ['requestJoinTeam']
 */
router.post(
  '/request-join-team',
  isAuthorized(),
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateRequestJoinTeam,
  requestJoinTeam
);

/**
 * @route GET /api/v1/client-management/managers
 * @description Get all active Transport Managers (id + name) for client to select
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} controller - ['getManagerList']
 */
router.get(
  '/managers',
  isAuthorized(),
  authorizedRoles([UserRole.STANDALONE_USER]),
  getManagerList
);

/**
 * @route GET /api/v1/client-management/join-requests
 * @description Get all pending join requests for the Transport Manager (uses req.user._id)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} controller - ['getPendingRequests']
 */
router.get(
  '/join-requests',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  getPendingRequests
);

/**
 * @route PUT /api/v1/client-management/join-requests/:clientId
 * @description Approve or reject a pending join request (TM only, managerId from token)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validation - ['validateClientIdParam', 'validateUpdateJoinRequest']
 * @param {function} controller - ['updateJoinRequest']
 */
router.put(
  '/join-requests/:clientId',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientIdParam,
  validateUpdateJoinRequest,
  updateJoinRequest
);

/**
 * @route DELETE /api/v1/client-management/clients/:clientId/remove-manager
 * @description Remove client from Transport Manager
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN, STANDALONE_USER)
 * @param {function} validation - ['validateClientIdParam']
 * @param {function} controller - ['removeClientFromManager']
 */
router.delete(
  '/clients/:clientId/remove-manager',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN, UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateClientIdParam,
  removeClientFromManager
);

/**
 * @route GET /api/v1/client-management/client-limit
 * @description Check client limit status (uses req.user._id, no param needed)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} controller - ['getClientLimit']
 */
router.get(
  '/client-limit',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  getClientLimit
);

/**
 * @route PUT /api/v1/client-management/transport-manager/:managerId/client-limit
 * @description Update client limit
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (SUPER_ADMIN)
 * @param {function} validation - ['validateManagerIdParam', 'validateUpdateClientLimit']
 * @param {function} controller - ['updateClientLimit']
 */
router.put(
  '/transport-manager/:managerId/client-limit',
  isAuthorized(),
  authorizedRoles([UserRole.SUPER_ADMIN]),
  // checkSubscriptionValidity,
  validateManagerIdParam,
  validateUpdateClientLimit,
  updateClientLimit
);

// ═══════════════════════════════════════════════════════════════
//  LEAVE REQUEST FLOW (Client → Manager)
// ═══════════════════════════════════════════════════════════════

/**
 * @route PATCH /api/v1/client-management/request-leave
 * @description Client requests to leave their Transport Manager's team (clientId from token)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} controller - ['requestLeave']
 */
router.patch(
  '/request-leave',
  isAuthorized(),
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  requestLeave
);

/**
 * @route GET /api/v1/client-management/leave-requests
 * @description Get all leave requests for the Transport Manager (uses req.user._id)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} controller - ['getLeaveRequests']
 */
router.get(
  '/leave-requests',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  getLeaveRequests
);

/**
 * @route PATCH /api/v1/client-management/leave-requests/:clientId
 * @description Transport Manager accepts or rejects a leave request (managerId from token)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validation - ['validateClientIdParam', 'validateAction']
 * @param {function} controller - ['handleLeaveRequest']
 */
router.patch(
  '/leave-requests/:clientId',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientIdParam,
  validateAction,
  handleLeaveRequest
);

// ═══════════════════════════════════════════════════════════════
//  REMOVE REQUEST FLOW (Manager → Client)
// ═══════════════════════════════════════════════════════════════

/**
 * @route PATCH /api/v1/client-management/request-remove/:clientId
 * @description Transport Manager requests to remove a client from their team (managerId from token)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (TRANSPORT_MANAGER)
 * @param {function} validation - ['validateClientIdParam']
 * @param {function} controller - ['requestRemove']
 */
router.patch(
  '/request-remove/:clientId',
  isAuthorized(),
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  // checkSubscriptionValidity,
  validateClientIdParam,
  requestRemove
);

/**
 * @route GET /api/v1/client-management/remove-request
 * @description Client checks if they have a pending remove request (clientId from token)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} controller - ['getRemoveRequest']
 */
router.get(
  '/remove-request',
  isAuthorized(),
  authorizedRoles([UserRole.STANDALONE_USER]),
  getRemoveRequest
);

/**
 * @route PATCH /api/v1/client-management/remove-request
 * @description Client accepts or rejects a remove request from their manager (clientId from token)
 * @access Private
 * @param {function} isAuthorized - Middleware to check if the user is authenticated
 * @param {function} authorizedRoles - Middleware to check if the user has the required role(s) (STANDALONE_USER)
 * @param {function} validation - ['validateAction']
 * @param {function} controller - ['handleRemoveRequest']
 */
router.patch(
  '/remove-request',
  isAuthorized(),
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateAction,
  handleRemoveRequest
);

// Export the router
module.exports = router;
