// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  createBlog,
  createManyBlog,
  updateBlog,
  updateManyBlog,
  deleteBlog,
  deleteManyBlog,
  getBlogById,
  getManyBlog
} from './blog.controller';

//Import validation from corresponding module
import { validateCreateBlog, validateCreateManyBlog, validateUpdateBlog, validateUpdateManyBlog} from './blog.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/blog/create-blog
 * @description Create a new blog
 * @access Public
 * @param {function} validation - ['validateCreateBlog']
 * @param {function} controller - ['createBlog']
 */
router.post("/create-blog", validateCreateBlog, createBlog);

/**
 * @route POST /api/v1/blog/create-blog/many
 * @description Create multiple blogs
 * @access Public
 * @param {function} validation - ['validateCreateManyBlog']
 * @param {function} controller - ['createManyBlog']
 */
router.post("/create-blog/many", validateCreateManyBlog, createManyBlog);

/**
 * @route PATCH /api/v1/blog/update-blog/many
 * @description Update multiple blogs information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateManyBlog']
 * @param {function} controller - ['updateManyBlog']
 */
router.patch("/update-blog/many", validateIds, validateUpdateManyBlog, updateManyBlog);

/**
 * @route PATCH /api/v1/blog/update-blog/:id
 * @description Update blog information
 * @param {string} id - The ID of the blog to update
 * @access Public
 * @param {function} validation - ['validateId', 'validateUpdateBlog']
 * @param {function} controller - ['updateBlog']
 */
router.patch("/update-blog/:id", validateId, validateUpdateBlog, updateBlog);

/**
 * @route DELETE /api/v1/blog/delete-blog/many
 * @description Delete multiple blogs
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteManyBlog']
 */
router.delete("/delete-blog/many", validateIds, deleteManyBlog);

/**
 * @route DELETE /api/v1/blog/delete-blog/:id
 * @description Delete a blog
 * @param {string} id - The ID of the blog to delete
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['deleteBlog']
 */
router.delete("/delete-blog/:id", validateId, deleteBlog);

/**
 * @route GET /api/v1/blog/get-blog/many
 * @description Get multiple blogs
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getManyBlog']
 */
router.get("/get-blog/many", validateSearchQueries, getManyBlog);

/**
 * @route GET /api/v1/blog/get-blog/:id
 * @description Get a blog by ID
 * @param {string} id - The ID of the blog to retrieve
 * @access Public
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['getBlogById']
 */
router.get("/get-blog/:id", validateId, getBlogById);

// Export the router
module.exports = router;