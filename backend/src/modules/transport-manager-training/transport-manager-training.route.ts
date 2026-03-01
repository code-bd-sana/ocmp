// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createTransportManagerTraining,
  createManyTransportManagerTraining,
  updateTransportManagerTraining,
  updateManyTransportManagerTraining,
  deleteTransportManagerTraining,
  deleteManyTransportManagerTraining,
  getTransportManagerTrainingById,
  getManyTransportManagerTraining
} from './transport-manager-training.controller';

//Import validation from corresponding module
import { validateCreateTransportManagerTraining, validateCreateManyTransportManagerTraining, validateUpdateTransportManagerTraining, validateUpdateManyTransportManagerTraining} from './transport-manager-training.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/transport-manager-training/create-transport-manager-training
 * @description Create a new transport-manager-training
 * @access Public
 * @param {function} validation - ['validateCreateTransportManagerTraining']
 * @param {function} controller - ['createTransportManagerTraining']
 */
router.post("/create-transport-manager-training", validateCreateTransportManagerTraining, createTransportManagerTraining);

/**
 * @route POST /api/v1/transport-manager-training/create-transport-manager-training/many
 * @description Create multiple transport-manager-trainings
 * @access Public
 * @param {function} validation - ['validateCreateManyTransportManagerTraining']
 * @param {function} controller - ['createManyTransportManagerTraining']
 */
router.post("/create-transport-manager-training/many", validateCreateManyTransportManagerTraining, createManyTransportManagerTraining);

/**
 * @route PUT /api/v1/transport-manager-training/update-transport-manager-training/many
 * @description Update multiple transport-manager-trainings information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManyTransportManagerTraining']
 * @param {function} controller - ['updateManyTransportManagerTraining']
 */
router.put("/update-transport-manager-training/many", validateIds, validateUpdateManyTransportManagerTraining, updateManyTransportManagerTraining);

/**
 * @route PUT /api/v1/transport-manager-training/update-transport-manager-training/:id
 * @description Update transport-manager-training information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to update
 * @param {function} validation - ['validateId', 'validateUpdateTransportManagerTraining']
 * @param {function} controller - ['updateTransportManagerTraining']
 */
router.put("/update-transport-manager-training/:id", validateId, validateUpdateTransportManagerTraining, updateTransportManagerTraining);

/**
 * @route DELETE /api/v1/transport-manager-training/delete-transport-manager-training/many
 * @description Delete multiple transport-manager-trainings
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManyTransportManagerTraining']
 */
router.delete("/delete-transport-manager-training/many", validateIds, deleteManyTransportManagerTraining);

/**
 * @route DELETE /api/v1/transport-manager-training/delete-transport-manager-training/:id
 * @description Delete a transport-manager-training
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteTransportManagerTraining']
 */
router.delete("/delete-transport-manager-training/:id", validateId, deleteTransportManagerTraining);

/**
 * @route GET /api/v1/transport-manager-training/get-transport-manager-training/many
 * @description Get multiple transport-manager-trainings
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyTransportManagerTraining']
 */
router.get("/get-transport-manager-training/many", validateSearchQueries, getManyTransportManagerTraining);

/**
 * @route GET /api/v1/transport-manager-training/get-transport-manager-training/:id
 * @description Get a transport-manager-training by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the transport-manager-training to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getTransportManagerTrainingById']
 */
router.get("/get-transport-manager-training/:id", validateId, getTransportManagerTrainingById);

// Export the router
module.exports = router;