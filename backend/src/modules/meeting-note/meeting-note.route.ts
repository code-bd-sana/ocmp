// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import {
  updateMeetingNote,
  deleteMeetingNote,
  getMeetingNoteById,
  createMeetingNoteAsManager,
  getAllMeetingNote,
  createMeetingNoteAsStandalone,
} from './meeting-note.controller';

//Import validation from corresponding module
import {
  validateUpdateMeetingNote,
  validateCreateMeetingNoteAsManager,
  validateCreateMeetingNoteAsStandalone,
  validateUpdateMeetingNoteIds,
  validateDeleteMeetingNoteIds,
  validateSearchMeetingNoteQueries,
  validateGetMeetingNoteByIdParams,
} from './meeting-note.validation';
import { validateId, validateSearchQueries } from '../../handlers/common-zod-validator';
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
 * @route POST /api/v1/meeting-note/create-as-manager
 * @description Create a new meeting-note
 * @access protected (Transport Manager)
 * @param {function} validation - ['validateCreateMeetingNoteAsManager']
 * @param {function} controller - ['createMeetingNoteAsManager']
 */
router.post(
  '/create-as-manager',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateCreateMeetingNoteAsManager,
  validateClientForManagerMiddleware,
  createMeetingNoteAsManager
);

/**
 * @route POST /api/v1/meeting-note/create-as-standalone
 * @description Create a new meeting-note as standalone user
 * @access protected (Stand Alone User)
 * @param {function} validation - ['validateCreateMeetingNoteAsStandalone']
 * @param {function} controller - ['createMeetingNoteAsStandalone']
 */
router.post(
  '/create-as-standalone',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateCreateMeetingNoteAsStandalone,
  createMeetingNoteAsStandalone
);

/**
 * @route PATCH /api/v1/meeting-note/update-as-manager/:id/:standAloneId
 * @description Update a meeting-note by ID (Transport Manager can only update meeting-notes of their approved clients)
 * @access Private (Transport Manager)
 * @param {function} validation - ['validateUpdateMeetingNoteIds', 'validateUpdateMeetingNote']
 * @param {function} controller - ['updateMeetingNote']
 */

router.patch(
  '/update-as-manager/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateUpdateMeetingNoteIds,
  validateUpdateMeetingNote,
  updateMeetingNote
);

/**
 * @route PATCH /api/v1/meeting-note/update-as-standalone/:id
 * @description Update a meeting-note by ID (Standalone User)
 * @access Private (Standalone User)
 * @param {function} validation - ['validateId', 'validateUpdateMeetingNote']
 * @param {function} controller - ['updateMeetingNote']
 */
router.patch(
  '/update-as-standalone/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  // checkSubscriptionValidity,
  validateId,
  validateUpdateMeetingNote,
  updateMeetingNote
);

/**
 * @route DELETE /api/v1/meeting-note/:id/:standAloneId
 * @description Delete a meeting-note
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteMeetingNote']
 */
router.delete(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateDeleteMeetingNoteIds,
  deleteMeetingNote
);

/**
 * @route DELETE /api/v1/meeting-note/:id
 * @description Delete a meeting-note
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteMeetingNote']
 */
router.delete('/:id', authorizedRoles([UserRole.STANDALONE_USER]), validateId, deleteMeetingNote);

/**
 * @route GET /api/v1/meeting-note/get-all
 * @description Get multiple meeting-notes
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getAllMeetingNote']
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
  getAllMeetingNote
);

/**
 * @route GET /api/v1/meeting-note/:id/:standAloneId
 * @description Get a meeting-note by ID
 * @access Private (Transport Manager or Standalone User)
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getMeetingNoteById']
 */
router.get(
  '/:id/:standAloneId',
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateGetMeetingNoteByIdParams,
  getMeetingNoteById
);

/**
 * @route GET /api/v1/meeting-note/:id
 * @description Get a meeting-note by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the meeting-note to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getMeetingNoteById']
 */
router.get(
  '/:id',
  authorizedRoles([UserRole.STANDALONE_USER]),
  validateGetMeetingNoteByIdParams,
  getMeetingNoteById
);

// Export the router
module.exports = router;
