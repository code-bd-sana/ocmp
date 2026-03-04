// Import Router from express
import { NextFunction, Router, Response } from 'express';

// Import controller from corresponding module
import {
  updatePlanner,
  deletePlanner,
  getPlannerById,
  getManyPlanner,
  createPlannerAsManager,
  createPlannerAsStandAlone,
  requestChangePlannerDate,
  updatePlannerAsStandAlone,
  getAllRequestedPlanners,
  approvalForPlannerChangesRequest,
  rejectPlannerChangeRequest,
} from './planner.controller';

//Import validation from corresponding module
import {
  validateCreatePlannerAsManager,
  validateCreatePlannerAsStandAlone,
  validateIdParam,
  validateIdAndManagerParam,
  validationRequestChangePlannerDate,
  validateUpdatePlannerAsManager,
  validateUpdatePlannerAsStandAlone,
  validateRequestChangePlannerPrams,
} from './planner.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
import { validateSearchPlannerQueries } from './planner.validation';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import ServerResponse from '../../helpers/responses/custom-response';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * Create Planner as Transport Manager
 *
 * @route POST /api/v1/planner/create-planner
 * @description Create a new planner as Transport Manager
 * @access Private
 * @param {function} validation - ['validateCreatePlannerAsManager']
 * @param {function} controller - ['createPlannerAsManager']
 */
router.post(
  '/create-planner',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreatePlannerAsManager,
  validateClientForManagerMiddleware,
  createPlannerAsManager
);

/**
 * Create Planner as Standalone User
 *
 * @route POST /api/v1/planner/create-planner-standalone
 * @description Create a new planner as Standalone User
 * @access Private
 * @param {function} validation - ['validateCreatePlannerAsStandAlone']
 * @param {function} controller - ['createPlannerAsStandAlone']
 */
router.post(
  '/create-planner-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreatePlannerAsStandAlone,
  createPlannerAsStandAlone
);

/**
 * Request change of planner date as Standalone User
 *
 * @route POST /api/v1/planner/request-change-planner-date/:id
 * @description Request change of planner date as Standalone User
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to request change for
 * @param {function} validation - ['validateId', 'validationRequestChangePlannerDate']
 * @param {function} controller - ['requestChangePlannerDate']
 */
router.post(
  '/request-change-planner-date/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateIdParam,
  validationRequestChangePlannerDate,
  requestChangePlannerDate
);

/**
 * Update planner information by Id as Transport Manager
 *
 * @route PATCH /api/v1/planner/update-planner/:id/:standAloneId
 * @description Update planner information as Transport Manager
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update
 * @param {function} validation - ['validateId', 'validateUpdatePlannerAsManager']
 * @param {function} controller - ['updatePlanner']
 */
router.patch(
  '/update-planner/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateIdAndManagerParam,
  validateUpdatePlannerAsManager,
  updatePlanner
);

/**
 *
 * Update planner information by Id as Standalone User, who is not under the transport manager
 *
 * @route PATCH /api/v1/planner/update-planner/:id
 * @description Update planner information as Standalone User
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update
 * @param {function} validation - ['validateId', 'validateUpdatePlannerAsStandAlone']
 */
router.patch(
  '/update-planner/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateIdParam,
  validateUpdatePlannerAsStandAlone,
  updatePlannerAsStandAlone
);

/**
 * Update planner information by Id as Standalone User, who is under the transport manager, to request approval for the changes
 *
 * @route PATCH /api/v1/planner/request-approval/:id
 * @description Update planner information as Standalone User to request approval for the changes
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to update
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['approvalForPlannerChangesRequest']
 */
router.patch(
  '/request-approval/:id',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateIdParam,
  approvalForPlannerChangesRequest
);

/**
 * Reject planner change request by Id as Transport Manager
 *
 * @route PATCH /api/v1/planner/request-reject/:id
 * @description Reject planner change request by Id as Transport Manager
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner change request to reject
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['rejectPlannerChangeRequest']
 */
router.patch(
  '/request-reject/:id',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateIdParam,
  rejectPlannerChangeRequest
);

/**
 * @route DELETE /api/v1/planner/delete-planner/:id
 * @description Delete a planner
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deletePlanner']
 */
router.delete('/delete-planner/:id', validateId, deletePlanner);

/**
 * @route GET /api/v1/planner/get-planner/many
 * @description Get multiple planners
 * @access Private
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyPlanner']
 */
router.get(
  '/get-planner/many',
  authorizedRoles([UserRole.STANDALONE_USER, UserRole.TRANSPORT_MANAGER]),
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchPlannerQueries(req, res, next);
    }
    return validateSearchQueries(req, res, next);
  },
  getManyPlanner
);

/**
 * As a Transport Manager, Get all of the request planners that the stand alone users created who are under this transport manager
 *
 * @route GET /api/v1/planner/get-planner/requests/:standAloneId
 * @description Get all of the request planners that the stand alone users created who are under this transport manager
 * @access Private
 * @param {IdOrIdsInput['id']} standAloneId - The ID of the standalone user to get the requested planners for
 * @param {function} validation - ['validateRequestChangePlannerPrams']
 * @param {function} middleware - ['validateClientForManagerMiddleware']
 * @param {function} controller - ['getAllRequestedPlanners']
 */
router.get(
  '/get-planner/requests/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateRequestChangePlannerPrams,
  validateClientForManagerMiddleware,
  getAllRequestedPlanners
);

/**
 * Get a planner by ID as Transport Manager
 *
 * @route GET /api/v1/planner/get-planner/:id/:standAloneId
 * @description Get a planner by ID as Transport Manager
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPlannerById']
 */
router.get(
  '/get-planner/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  getPlannerById
);

/**
 * Get a planner by ID as Standalone User
 *
 * @route GET /api/v1/planner/get-planner/:id
 * @description Get a planner by ID as Standalone User
 * @access Private
 * @param {IdOrIdsInput['id']} id - The ID of the planner to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getPlannerById']
 */
router.get(
  '/get-planner/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateIdParam,
  getPlannerById
);

// Export the router
module.exports = router;

