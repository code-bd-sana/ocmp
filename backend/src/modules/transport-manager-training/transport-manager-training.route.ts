// Import Router from express
import { NextFunction, Response, Router } from 'express';

// Import controller from corresponding module
import {
  createTransportManagerTrainingAsManager,
  createTransportManagerTrainingAsStandAlone,
  deleteTransportManagerTraining,
  getManyTransportManagerTraining,
  getTransportManagerTrainingById,
  updateTransportManagerTraining,
} from './transport-manager-training.controller';

//Import validation from corresponding module
import { validateSearchQueries } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import authorizedRoles from '../../middlewares/authorized-roles';
import isAuthorized, { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';
import { UserRole } from '../../models';

import {
  validateCreateTransportManagerTrainingAsManager,
  validateCreateTransportManagerTrainingAsStandAlone,
  validateSearchTransportManagerTrainingQueries,
  validateTransportManagerTrainingAndManagerIdParam,
  validateTransportManagerTrainingIdParam,
  validateUpdateTransportManagerTraining,
} from './transport-manager-training.validation';

// Initialize router
const router = Router();
router.use(isAuthorized());

// Define route handlers
/**
 * @route POST /api/v1/transport-manager-training/create-transport-manager-training
 * @description Create a new transport-manager-training
 * @access Public
 * @param {function} validation - ['validateCreateTransportManagerTraining']
 * @param {function} controller - ['createTransportManagerTraining']
 */
router.post(
  '/create-transport-manager-training',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateTransportManagerTrainingAsManager,
  validateClientForManagerMiddleware,
  createTransportManagerTrainingAsManager
);

router.post(
  '/create-stand-alone-transport-manager-training',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateTransportManagerTrainingAsStandAlone,
  createTransportManagerTrainingAsStandAlone
);

/**
 * @route PATCH /api/v1/transport-manager-training/update-transport-manager-training/:id
 * @description Update transport-manager-training information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to update
 * @param {function} validation - ['validateId', 'validateUpdateTransportManagerTraining']
 * @param {function} controller - ['updateTransportManagerTraining']
 */
router.patch(
  '/update-transport-manager-training/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTransportManagerTrainingAndManagerIdParam,
  validateUpdateTransportManagerTraining,
  updateTransportManagerTraining
);

router.patch(
  '/update-transport-manager-training/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTransportManagerTrainingIdParam,
  validateUpdateTransportManagerTraining,
  updateTransportManagerTraining
);

/**
 * @route DELETE /api/v1/transport-manager-training/delete-transport-manager-training/:id
 * @description Delete a transport-manager-training
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTransportManagerTraining']
 */
router.delete(
  '/delete-transport-manager-training/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTransportManagerTrainingAndManagerIdParam,
  deleteTransportManagerTraining
);

router.delete(
  '/delete-transport-manager-training/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTransportManagerTrainingIdParam,
  deleteTransportManagerTraining
);

/**
 * @route GET /api/v1/transport-manager-training/get-transport-manager-training/many
 * @description Get multiple transport-manager-trainings
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTransportManagerTraining']
 */
router.get(
  '/get-transport-manager-training/many',
  authorizedRoles([UserRole.TRANSPORT_MANAGER, UserRole.STANDALONE_USER]),
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
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (req.user!.role === UserRole.TRANSPORT_MANAGER) {
      return validateSearchTransportManagerTrainingQueries(req, _res, next);
    }
    return validateSearchQueries(req, _res, next);
  },
  getManyTransportManagerTraining
);

/**
 * @route GET /api/v1/transport-manager-training/get-transport-manager-training/:id
 * @description Get a transport-manager-training by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTransportManagerTrainingById']
 */
router.get(
  '/get-transport-manager-training/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateTransportManagerTrainingAndManagerIdParam,
  getTransportManagerTrainingById
);

router.get(
  '/get-transport-manager-training/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateTransportManagerTrainingIdParam,
  getTransportManagerTrainingById
);

// Export the router
module.exports = router;
