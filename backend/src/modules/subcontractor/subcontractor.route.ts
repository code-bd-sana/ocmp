// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createSubcontractor,
  updateSubcontractor,
  updateManySubcontractor,
  deleteSubcontractor,
  deleteManySubcontractor,
  getSubcontractorById,
  getManySubcontractor
} from './subcontractor.controller';

//Import validation from corresponding module
import { validateCreateSubcontractor, validateCreateManySubcontractor, validateUpdateSubcontractor, validateUpdateManySubcontractor} from './subcontractor.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';
import isAuthorized from '../../middlewares/is-authorized';
import authorizedRoles from '../../middlewares/authorized-roles';
import { UserRole } from '../../models';
import { validateClientForManagerMiddleware } from '../../middlewares/validate-client-for-manager';

// Initialize router
const router = Router();

router.use(isAuthorized())

// Define route handlers
/**
 * @route POST /api/v1/subcontractor/create-subcontractor
 * @description Create a new subcontractor
 * @access Public
 * @param {function} validation - ['validateCreateSubcontractor']
 * @param {function} controller - ['createSubcontractor']
 */
router.post(
  "/create-subcontractor", 
  authorizedRoles([UserRole.TRANSPORT_MANAGER]),
  validateClientForManagerMiddleware,
  validateCreateSubcontractor, 
  createSubcontractor
);


/**
 * @route PUT /api/v1/subcontractor/update-subcontractor/many
 * @description Update multiple subcontractors information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManySubcontractor']
 * @param {function} controller - ['updateManySubcontractor']
 */
router.put("/update-subcontractor/many", validateIds, validateUpdateManySubcontractor, updateManySubcontractor);

/**
 * @route PUT /api/v1/subcontractor/update-subcontractor/:id
 * @description Update subcontractor information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subcontractor to update
 * @param {function} validation - ['validateId', 'validateUpdateSubcontractor']
 * @param {function} controller - ['updateSubcontractor']
 */
router.put("/update-subcontractor/:id", validateId, validateUpdateSubcontractor, updateSubcontractor);

/**
 * @route DELETE /api/v1/subcontractor/delete-subcontractor/many
 * @description Delete multiple subcontractors
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManySubcontractor']
 */
router.delete("/delete-subcontractor/many", validateIds, deleteManySubcontractor);

/**
 * @route DELETE /api/v1/subcontractor/delete-subcontractor/:id
 * @description Delete a subcontractor
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subcontractor to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteSubcontractor']
 */
router.delete("/delete-subcontractor/:id", validateId, deleteSubcontractor);

/**
 * @route GET /api/v1/subcontractor/get-subcontractor/many
 * @description Get multiple subcontractors
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManySubcontractor']
 */
router.get("/get-subcontractor/many", validateSearchQueries, getManySubcontractor);

/**
 * @route GET /api/v1/subcontractor/get-subcontractor/:id
 * @description Get a subcontractor by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the subcontractor to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getSubcontractorById']
 */
router.get("/get-subcontractor/:id", validateId, getSubcontractorById);

// Export the router
module.exports = router;