import { Request, Response } from 'express';
import { blogServices } from './blog.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single Blog.
 *
 * @param {Request} req - The request object containing blog data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>>} - The created blog.
 * @throws {Error} - Throws an error if the blog creation fails.
 */
export const createBlog = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new blog and get the result
  const result = await blogServices.createBlog(req.body);
  if (!result) throw new Error('Failed to create blog');
  // Send a success response with the created blog data
  ServerResponse(res, true, 201, 'Blog created successfully', result);
});

/**
 * Controller function to handle the creation of multiple blogs.
 *
 * @param {Request} req - The request object containing an array of blog data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>[]>} - The created blogs.
 * @throws {Error} - Throws an error if the blogs creation fails.
 */
export const createManyBlog = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple blogs and get the result
  const result = await blogServices.createManyBlog(req.body);
  if (!result) throw new Error('Failed to create multiple blogs');
  // Send a success response with the created blogs data
  ServerResponse(res, true, 201, 'Blogs created successfully', result);
});

/**
 * Controller function to handle the update operation for a single blog.
 *
 * @param {Request} req - The request object containing the ID of the blog to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>>} - The updated blog.
 * @throws {Error} - Throws an error if the blog update fails.
 */
export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the blog by ID and get the result
  const result = await blogServices.updateBlog(id as string, req.body);
  if (!result) throw new Error('Failed to update blog');
  // Send a success response with the updated blog data
  ServerResponse(res, true, 200, 'Blog updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple blogs.
 *
 * @param {Request} req - The request object containing an array of blog data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>[]>} - The updated blogs.
 * @throws {Error} - Throws an error if the blogs update fails.
 */
export const updateManyBlog = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple blogs and get the result
  const result = await blogServices.updateManyBlog(req.body);
  if (!result.length) throw new Error('Failed to update multiple blogs');
  // Send a success response with the updated blogs data
  ServerResponse(res, true, 200, 'Blogs updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single blog.
 *
 * @param {Request} req - The request object containing the ID of the blog to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>>} - The deleted blog.
 * @throws {Error} - Throws an error if the blog deletion fails.
 */
export const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the blog by ID
  const result = await blogServices.deleteBlog(id as string);
  if (!result) throw new Error('Failed to delete blog');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, 'Blog deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple blogs.
 *
 * @param {Request} req - The request object containing an array of IDs of blog to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>[]>} - The deleted blogs.
 * @throws {Error} - Throws an error if the blog deletion fails.
 */
export const deleteManyBlog = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple blogs and get the result
  const result = await blogServices.deleteManyBlog(req.body);
  if (!result) throw new Error('Failed to delete multiple blogs');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, 'Blogs deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single blog by ID.
 *
 * @param {Request} req - The request object containing the ID of the blog to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>>} - The retrieved blog.
 * @throws {Error} - Throws an error if the blog retrieval fails.
 */
export const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the blog by ID and get the result
  const result = await blogServices.getBlogById(id as string);
  if (!result) throw new Error('Blog not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, 'Blog retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple blogs.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<IBlog>[]>} - The retrieved blogs.
 * @throws {Error} - Throws an error if the blogs retrieval fails.
 */
export const getManyBlog = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters 
  const query = req.query as unknown as { searchKey?: string, showPerPage: number, pageNo: number };
  // Call the service method to get multiple blogs based on query parameters and get the result
  const { blogs, totalData, totalPages } = await blogServices.getManyBlog(query);
  if (!blogs) throw new Error('Failed to retrieve blogs');
  // Send a success response with the retrieved blogs data
  ServerResponse(res, true, 200, 'Blogs retrieved successfully', { blogs, totalData, totalPages });
});