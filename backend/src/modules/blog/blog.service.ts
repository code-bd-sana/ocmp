// Import the model
import BlogModel, { IBlog } from './blog.model';

/**
 * Service function to create a new blog.
 *
 * @param {Partial<IBlog>} data - The data to create a new blog.
 * @returns {Promise<Partial<IBlog>>} - The created blog.
 */
const createBlog = async (data: Partial<IBlog>): Promise<Partial<IBlog>> => {
  const newBlog = new BlogModel(data);
  const savedBlog = await newBlog.save();
  return savedBlog;
};

/**
 * Service function to create multiple blog.
 *
 * @param {Partial<IBlog>[]} data - An array of data to create multiple blog.
 * @returns {Promise<Partial<IBlog>[]>} - The created blog.
 */
const createManyBlog = async (data: Partial<IBlog>[]): Promise<Partial<IBlog>[]> => {
  const createdBlog = await BlogModel.insertMany(data);
  return createdBlog;
};

/**
 * Service function to update a single blog by ID.
 *
 * @param {string} id - The ID of the blog to update.
 * @param {Partial<IBlog>} data - The updated data for the blog.
 * @returns {Promise<Partial<IBlog>>} - The updated blog.
 */
const updateBlog = async (id: string, data: Partial<IBlog>): Promise<Partial<IBlog | null>> => {
  const updatedBlog = await BlogModel.findByIdAndUpdate(id, data, { new: true });
  return updatedBlog;
};

/**
 * Service function to update multiple blog.
 *
 * @param {Array<{ id: string, updates: Partial<IBlog> }>} data - An array of data to update multiple blog.
 * @returns {Promise<Partial<IBlog>[]>} - The updated blog.
 */
const updateManyBlog = async (data: Array<{ id: string, updates: Partial<IBlog> }>): Promise<Partial<IBlog>[]> => {
  const updatePromises = data.map(({ id, updates }) =>
    BlogModel.findByIdAndUpdate(id, updates, { new: true })
  );
  const updatedBlog = await Promise.all(updatePromises);
  // Filter out null values
  const validUpdatedBlog = updatedBlog.filter(item => item !== null) as IBlog[];
  return validUpdatedBlog;
};

/**
 * Service function to delete a single blog by ID.
 *
 * @param {string} id - The ID of the blog to delete.
 * @returns {Promise<Partial<IBlog>>} - The deleted blog.
 */
const deleteBlog = async (id: string): Promise<Partial<IBlog | null>> => {
  const deletedBlog = await BlogModel.findByIdAndDelete(id);
  return deletedBlog;
};

/**
 * Service function to delete multiple blog.
 *
 * @param {string[]} ids - An array of IDs of blog to delete.
 * @returns {Promise<Partial<IBlog>[]>} - The deleted blog.
 */
const deleteManyBlog = async (ids: string[]): Promise<Partial<IBlog>[]> => {
  const blogToDelete = await BlogModel.find({ _id: { $in: ids } });
  if (!blogToDelete.length) throw new Error('No blog found to delete');
  await BlogModel.deleteMany({ _id: { $in: ids } });
  return blogToDelete; 
};

/**
 * Service function to retrieve a single blog by ID.
 *
 * @param {string} id - The ID of the blog to retrieve.
 * @returns {Promise<Partial<IBlog>>} - The retrieved blog.
 */
const getBlogById = async (id: string): Promise<Partial<IBlog | null>> => {
  const blog = await BlogModel.findById(id);
  return blog;
};

/**
 * Service function to retrieve multiple blog based on query parameters.
 *
 * @param {object} query - The query parameters for filtering blog.
 * @returns {Promise<Partial<IBlog>[]>} - The retrieved blog
 */
const getManyBlog = async (query: {
  searchKey?: string;
  showPerPage: number;
  pageNo: number;
}): Promise<{ blogs: Partial<IBlog>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage, pageNo } = query;

  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      { fieldName: { $regex: searchKey, $options: 'i' } },
      { fieldName: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed
    ],
  };

  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;

  // Find the total count of matching blog
  const totalData = await BlogModel.countDocuments(searchFilter);

  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);

  // Find blog based on the search filter with pagination
  const blogs = await BlogModel.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed

  return { blogs, totalData, totalPages };
};

export const blogServices = {
  createBlog,
  createManyBlog,
  updateBlog,
  updateManyBlog,
  deleteBlog,
  deleteManyBlog,
  getBlogById,
  getManyBlog,
};