#!/usr/bin/env node

const [, , command, ...args] = process.argv;

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const readline = require('readline');

// Define color codes for console output
const RED = '\x1b[31m'; // Red color
const GREEN = '\x1b[32m'; // Green color
const BLUE = '\x1b[34m'; // Blue color
const RESET = '\x1b[0m'; // Reset color

// Regular expression to check for special characters
const specialCharRegex = /[0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/~`|\-=\s]/g;

// Helper function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to convert string to camelCase after replacing unwanted characters with hyphens
function toCamelCase(str) {
  // Replace all non-alphabetic characters (except hyphens) with hyphens
  const hyphenatedStr = str.replace(/[^a-zA-Z]+/g, '-').replace(/^-+|-+$/g, '');

  // Convert hyphenated string to camelCase
  return hyphenatedStr
    .split('-') // Split the string by hyphens
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(''); // Join all words together without hyphens
}

if (command === 'resource') {
  // Command-line options setup
  program
    .version('1.0.0') // Version of the CLI tool
    .description('Generate route, model, controller, and interface files for a new resource') // Description of the tool
    .argument('<name>', 'Resource name') // Argument for resource name
    .action((name) => {
      const resourceName = !specialCharRegex.test(args[0])
        ? args[0].toLowerCase()
        : toCamelCase(args[0]);

      const capitalizedResourceName = capitalize(resourceName);

      // Path to the route directory
      const routeDir = path.join(__dirname, '..', 'src', 'modules', args[0]);
      // Create route file content
      const routeContent = `
// Import Router from express
import { Router } from 'express';

// Import controller from corresponding module
import { 
  create${capitalizedResourceName},
  createMany${capitalizedResourceName},
  update${capitalizedResourceName},
  updateMany${capitalizedResourceName},
  delete${capitalizedResourceName},
  deleteMany${capitalizedResourceName},
  get${capitalizedResourceName}ById,
  getMany${capitalizedResourceName}
} from './${args[0]}.controller';

//Import validation from corresponding module
import { validateCreate${capitalizedResourceName}, validateCreateMany${capitalizedResourceName}, validateUpdate${capitalizedResourceName}, validateUpdateMany${capitalizedResourceName}} from './${args[0]}.validation';
import { validateId, validateIds, validateSearchQueries } from '../../handlers/common-zod-validator';

// Initialize router
const router = Router();

// Define route handlers
/**
 * @route POST /api/v1/${args[0]}/create-${args[0]}
 * @description Create a new ${args[0]}
 * @access Public
 * @param {function} validation - ['validateCreate${capitalizedResourceName}']
 * @param {function} controller - ['create${capitalizedResourceName}']
 */
router.post("/create-${args[0]}", validateCreate${capitalizedResourceName}, create${capitalizedResourceName});

/**
 * @route POST /api/v1/${args[0]}/create-${args[0]}/many
 * @description Create multiple ${args[0]}s
 * @access Public
 * @param {function} validation - ['validateCreateMany${capitalizedResourceName}']
 * @param {function} controller - ['createMany${capitalizedResourceName}']
 */
router.post("/create-${args[0]}/many", validateCreateMany${capitalizedResourceName}, createMany${capitalizedResourceName});

/**
 * @route PUT /api/v1/${args[0]}/update-${args[0]}/many
 * @description Update multiple ${args[0]}s information
 * @access Public
 * @param {function} validation - ['validateIds', 'validateUpdateMany${capitalizedResourceName}']
 * @param {function} controller - ['updateMany${capitalizedResourceName}']
 */
router.put("/update-${args[0]}/many", validateIds, validateUpdateMany${capitalizedResourceName}, updateMany${capitalizedResourceName});

/**
 * @route PUT /api/v1/${args[0]}/update-${args[0]}/:id
 * @description Update ${args[0]} information
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the ${args[0]} to update
 * @param {function} validation - ['validateId', 'validateUpdate${capitalizedResourceName}']
 * @param {function} controller - ['update${capitalizedResourceName}']
 */
router.put("/update-${args[0]}/:id", validateId, validateUpdate${capitalizedResourceName}, update${capitalizedResourceName});

/**
 * @route DELETE /api/v1/${args[0]}/delete-${args[0]}/many
 * @description Delete multiple ${args[0]}s
 * @access Public
 * @param {function} validation - ['validateIds']
 * @param {function} controller - ['deleteMany${capitalizedResourceName}']
 */
router.delete("/delete-${args[0]}/many", validateIds, deleteMany${capitalizedResourceName});

/**
 * @route DELETE /api/v1/${args[0]}/delete-${args[0]}/:id
 * @description Delete a ${args[0]}
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the ${args[0]} to delete
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['delete${capitalizedResourceName}']
 */
router.delete("/delete-${args[0]}/:id", validateId, delete${capitalizedResourceName});

/**
 * @route GET /api/v1/${args[0]}/get-${args[0]}/many
 * @description Get multiple ${args[0]}s
 * @access Public
 * @param {function} validation - ['validateSearchQueries']
 * @param {function} controller - ['getMany${capitalizedResourceName}']
 */
router.get("/get-${args[0]}/many", validateSearchQueries, getMany${capitalizedResourceName});

/**
 * @route GET /api/v1/${args[0]}/get-${args[0]}/:id
 * @description Get a ${args[0]} by ID
 * @access Public
 * @param {IdOrIdsInput['id']} id - The ID of the ${args[0]} to retrieve
 * @param {function} validation - ['validateId']
 * @param {function} controller - ['get${capitalizedResourceName}ById']
 */
router.get("/get-${args[0]}/:id", validateId, get${capitalizedResourceName}ById);

// Export the router
module.exports = router;
    `;
      // Path to the route file
      const routeFilePath = path.join(routeDir, `${args[0]}.route.ts`);

      // Path to the controller directory
      const controllerDir = path.join(__dirname, '..', 'src', 'modules', args[0]);
      // Create controller file content
      const controllerContent = `
import { Request, Response } from 'express';
import { ${resourceName}Services } from './${args[0]}.service';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';

/**
 * Controller function to handle the creation of a single ${capitalizedResourceName}.
 *
 * @param {Request} req - The request object containing ${args[0]} data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The created ${resourceName}.
 * @throws {Error} - Throws an error if the ${resourceName} creation fails.
 */
export const create${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create a new ${args[0]} and get the result
  const result = await ${resourceName}Services.create${capitalizedResourceName}(req.body);
  if (!result) throw new Error('Failed to create ${resourceName}');
  // Send a success response with the created ${resourceName} data
  ServerResponse(res, true, 201, '${capitalizedResourceName} created successfully', result);
});

/**
 * Controller function to handle the creation of multiple ${args[0]}s.
 *
 * @param {Request} req - The request object containing an array of ${args[0]} data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The created ${resourceName}s.
 * @throws {Error} - Throws an error if the ${resourceName}s creation fails.
 */
export const createMany${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to create multiple ${resourceName}s and get the result
  const result = await ${resourceName}Services.createMany${capitalizedResourceName}(req.body);
  if (!result) throw new Error('Failed to create multiple ${resourceName}s');
  // Send a success response with the created ${args[0]}s data
  ServerResponse(res, true, 201, '${capitalizedResourceName}s created successfully', result);
});

/**
 * Controller function to handle the update operation for a single ${args[0]}.
 *
 * @param {Request} req - The request object containing the ID of the ${args[0]} to update in URL parameters and the updated data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The updated ${resourceName}.
 * @throws {Error} - Throws an error if the ${resourceName} update fails.
 */
export const update${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to update the ${args[0]} by ID and get the result
  const result = await ${resourceName}Services.update${capitalizedResourceName}(id as string, req.body);
  if (!result) throw new Error('Failed to update ${resourceName}');
  // Send a success response with the updated ${args[0]} data
  ServerResponse(res, true, 200, '${capitalizedResourceName} updated successfully', result);
});

/**
 * Controller function to handle the update operation for multiple ${args[0]}s.
 *
 * @param {Request} req - The request object containing an array of ${args[0]} data in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The updated ${resourceName}s.
 * @throws {Error} - Throws an error if the ${resourceName}s update fails.
 */
export const updateMany${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to update multiple ${args[0]}s and get the result
  const result = await ${resourceName}Services.updateMany${capitalizedResourceName}(req.body);
  if (!result.length) throw new Error('Failed to update multiple ${resourceName}s');
  // Send a success response with the updated ${args[0]}s data
  ServerResponse(res, true, 200, '${capitalizedResourceName}s updated successfully', result);
});

/**
 * Controller function to handle the deletion of a single ${args[0]}.
 *
 * @param {Request} req - The request object containing the ID of the ${args[0]} to delete in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The deleted ${resourceName}.
 * @throws {Error} - Throws an error if the ${resourceName} deletion fails.
 */
export const delete${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to delete the ${args[0]} by ID
  const result = await ${resourceName}Services.delete${capitalizedResourceName}(id as string);
  if (!result) throw new Error('Failed to delete ${resourceName}');
  // Send a success response confirming the deletion
  ServerResponse(res, true, 200, '${capitalizedResourceName} deleted successfully');
});

/**
 * Controller function to handle the deletion of multiple ${args[0]}s.
 *
 * @param {Request} req - The request object containing an array of IDs of ${args[0]} to delete in the body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The deleted ${resourceName}s.
 * @throws {Error} - Throws an error if the ${resourceName} deletion fails.
 */
export const deleteMany${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  // Call the service method to delete multiple ${args[0]}s and get the result
  const result = await ${resourceName}Services.deleteMany${capitalizedResourceName}(req.body);
  if (!result) throw new Error('Failed to delete multiple ${resourceName}s');
  // Send a success response confirming the deletions
  ServerResponse(res, true, 200, '${capitalizedResourceName}s deleted successfully');
});

/**
 * Controller function to handle the retrieval of a single ${args[0]} by ID.
 *
 * @param {Request} req - The request object containing the ID of the ${args[0]} to retrieve in URL parameters.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The retrieved ${resourceName}.
 * @throws {Error} - Throws an error if the ${resourceName} retrieval fails.
 */
export const get${capitalizedResourceName}ById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // Call the service method to get the ${args[0]} by ID and get the result
  const result = await ${resourceName}Services.get${capitalizedResourceName}ById(id as string);
  if (!result) throw new Error('${capitalizedResourceName} not found');
  // Send a success response with the retrieved resource data
  ServerResponse(res, true, 200, '${capitalizedResourceName} retrieved successfully', result);
});

/**
 * Controller function to handle the retrieval of multiple ${args[0]}s.
 *
 * @param {Request} req - The request object containing query parameters for filtering.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The retrieved ${resourceName}s.
 * @throws {Error} - Throws an error if the ${resourceName}s retrieval fails.
 */
export const getMany${capitalizedResourceName} = catchAsync(async (req: Request, res: Response) => {
  // Type assertion for query parameters 
  const query = req.query as SearchQueryInput;
  // Call the service method to get multiple ${args[0]}s based on query parameters and get the result
  const { ${resourceName}s, totalData, totalPages } = await ${resourceName}Services.getMany${capitalizedResourceName}(query);
  if (!${resourceName}s) throw new Error('Failed to retrieve ${resourceName}s');
  // Send a success response with the retrieved ${args[0]}s data
  ServerResponse(res, true, 200, '${capitalizedResourceName}s retrieved successfully', { ${resourceName}s, totalData, totalPages });
});
    `;
      // Path to the controller file
      const controllerFilePath = path.join(controllerDir, `${args[0]}.controller.ts`);

      // Path to the interface directory
      const interfaceDir = path.join(__dirname, '..', 'src', 'modules', args[0]);
      // Create interface file content
      const interfaceContent = `
/**
 * Type definition for ${capitalizedResourceName}.
 *
 * This type defines the structure of a single ${resourceName} object.
 * @interface T${capitalizedResourceName}
 */
export interface T${capitalizedResourceName} {
  // Add fields as needed
}
    `;
      // Path to the interface file
      const interfaceFilePath = path.join(interfaceDir, `${args[0]}.interface.ts`);

      // Path to the model directory
      const modelsDir = path.join(__dirname, '..', 'src', 'modules', args[0]);
      // Create model content
      const modelContent = `
import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a ${capitalizedResourceName} document
export interface I${capitalizedResourceName} extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the ${capitalizedResourceName} schema
const ${capitalizedResourceName}Schema: Schema<I${capitalizedResourceName}> = new Schema({
  // Define schema fields here
  // Example fields (replace with actual schema)
  // fieldName: {
  //   type: Schema.Types.FieldType,
  //   required: true,
  //   trim: true,
  // },
},{
 timestamps: true,
 versionKey: false,
});

// Create the ${capitalizedResourceName} model
const ${capitalizedResourceName} = mongoose.model<I${capitalizedResourceName}>('${capitalizedResourceName}', ${capitalizedResourceName}Schema);

// Export the ${capitalizedResourceName} model
export default ${capitalizedResourceName};
    `;
      // Path to the model file
      const modelFilePath = path.join(modelsDir, `${args[0]}.model.ts`);

      // Path to the validation directory
      const validationDir = path.join(__dirname, '..', 'src', 'modules', args[0]);
      // Create Zod validation schema content
      const validationContent = `
import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * ${capitalizedResourceName} Validation Schemas and Types
 *
 * This module defines Zod schemas for validating ${resourceName}-related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single ${resourceName}.
 * 
 * → Add all **required** fields here
 */
const zodCreate${capitalizedResourceName}Schema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: '${capitalizedResourceName} name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type Create${capitalizedResourceName}Input = z.infer<typeof zodCreate${capitalizedResourceName}Schema>;

/**
 * Zod schema for validating **bulk creation** (array of ${resourceName} objects).
 */
const zodCreateMany${capitalizedResourceName}Schema = z
  .array(zodCreate${capitalizedResourceName}Schema)
  .min(1, { message: 'At least one ${resourceName} must be provided for bulk creation' });

export type CreateMany${capitalizedResourceName}Input = z.infer<typeof zodCreateMany${capitalizedResourceName}Schema>;

/**
 * Zod schema for validating data when **updating** an existing ${resourceName}.
 * 
 * → All fields should usually be .optional()
 */
const zodUpdate${capitalizedResourceName}Schema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    // email: z.string().email({ message: 'Invalid email format' }).optional(),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).optional(),
  })
  .strict();

export type Update${capitalizedResourceName}Input = z.infer<typeof zodUpdate${capitalizedResourceName}Schema>;

/**
 * Zod schema for validating bulk updates (array of partial ${resourceName} objects).
 */
const zodUpdateMany${capitalizedResourceName}ForBulkSchema = zodUpdate${capitalizedResourceName}Schema
  .extend({
    id: z.string().refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field to update must be provided',
  });

/**
 * Zod schema for validating an array of multiple ${resourceName} updates.
 */
const zodUpdateMany${capitalizedResourceName}Schema = z
  .array(zodUpdateMany${capitalizedResourceName}ForBulkSchema)
  .min(1, { message: 'At least one ${resourceName} update object must be provided' });

export type UpdateMany${capitalizedResourceName}Input = z.infer<typeof zodUpdateMany${capitalizedResourceName}Schema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreate${capitalizedResourceName} = validateBody(zodCreate${capitalizedResourceName}Schema);
export const validateCreateMany${capitalizedResourceName} = validateBody(zodCreateMany${capitalizedResourceName}Schema);
export const validateUpdate${capitalizedResourceName} = validateBody(zodUpdate${capitalizedResourceName}Schema);
export const validateUpdateMany${capitalizedResourceName} = validateBody(zodUpdateMany${capitalizedResourceName}Schema);
    `;
      // Path to the zod validation file
      const validationFilePath = path.join(validationDir, `${args[0]}.validation.ts`);

      // Path to the service directory
      const serviceDir = path.join(__dirname, '..', 'src', 'modules', args[0]);
      // Create service content
      const serviceContent = `
// Import the model
import mongoose from 'mongoose';
import ${capitalizedResourceName}Model, { I${capitalizedResourceName} } from './${args[0]}.model';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import {
  Create${capitalizedResourceName}Input,
  CreateMany${capitalizedResourceName}Input,
  Update${capitalizedResourceName}Input,
  UpdateMany${capitalizedResourceName}Input,
} from './${args[0]}.validation';

/**
 * Service function to create a new ${resourceName}.
 *
 * @param {Create${capitalizedResourceName}Input} data - The data to create a new ${resourceName}.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The created ${resourceName}.
 */
const create${capitalizedResourceName} = async (data: Create${capitalizedResourceName}Input): Promise<Partial<I${capitalizedResourceName}>> => {
  const new${capitalizedResourceName} = new ${capitalizedResourceName}Model(data);
  const saved${capitalizedResourceName} = await new${capitalizedResourceName}.save();
  return saved${capitalizedResourceName};
};

/**
 * Service function to create multiple ${resourceName}.
 *
 * @param {CreateMany${capitalizedResourceName}Input} data - An array of data to create multiple ${resourceName}.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The created ${resourceName}.
 */
const createMany${capitalizedResourceName} = async (data: CreateMany${capitalizedResourceName}Input): Promise<Partial<I${capitalizedResourceName}>[]> => {
  const created${capitalizedResourceName} = await ${capitalizedResourceName}Model.insertMany(data);
  return created${capitalizedResourceName};
};

/**
 * Service function to update a single ${resourceName} by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the ${resourceName} to update.
 * @param {Update${capitalizedResourceName}Input} data - The updated data for the ${resourceName}.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The updated ${resourceName}.
 */
const update${capitalizedResourceName} = async (id: IdOrIdsInput['id'], data: Update${capitalizedResourceName}Input): Promise<Partial<I${capitalizedResourceName} | null>> => {
  // Check for duplicate (filed) combination
  const existing${capitalizedResourceName} = await ${capitalizedResourceName}Model.findOne({
    _id: { $ne: id }, // Exclude the current document
    $or: [{ /* filedName: data.filedName, */ }],
  }).lean();
  // Prevent duplicate updates
  if (existing${capitalizedResourceName}) {
    throw new Error('Duplicate detected: Another ${resourceName} with the same fieldName already exists.');
  }
  // Proceed to update the ${resourceName}
  const updated${capitalizedResourceName} = await ${capitalizedResourceName}Model.findByIdAndUpdate(id, data, { new: true });
  return updated${capitalizedResourceName};
};

/**
 * Service function to update multiple ${resourceName}.
 *
 * @param {UpdateMany${capitalizedResourceName}Input} data - An array of data to update multiple ${resourceName}.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The updated ${resourceName}.
 */
const updateMany${capitalizedResourceName} = async (data: UpdateMany${capitalizedResourceName}Input): Promise<Partial<I${capitalizedResourceName}>[]> => {
// Early return if no data provided
  if (data.length === 0) {
    return [];
  }
  // Convert string ids to ObjectId (for safety)
  const objectIds = data.map((item) => new mongoose.Types.ObjectId(item.id));
  // Check for duplicates (filedName) excluding the documents being updated
  const existing${capitalizedResourceName} = await ${capitalizedResourceName}Model.find({
    _id: { $nin: objectIds }, // Exclude documents being updated
    $or: data.flatMap((item) => [
      // { filedName: item.filedName },
    ]),
  }).lean();
  // If any duplicates found, throw error
  if (existing${capitalizedResourceName}.length > 0) {
    throw new Error(
      'Duplicate detected: One or more ${resourceName} with the same fieldName already exist.'
    );
  }
  // Prepare bulk operations
  const operations = data.map((item) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(item.id) },
      update: { $set: item },
      upsert: false,
    },
  }));
  // Execute bulk update
  const bulkResult = await ${capitalizedResourceName}Model.bulkWrite(operations, {
    ordered: true, // keep order of operations
  });
  // check if all succeeded
  if (bulkResult.matchedCount !== data.length) {
    throw new Error('Some documents were not found or updated');
  }
  // Fetch the freshly updated documents
  const updatedDocs = await ${capitalizedResourceName}Model.find({ _id: { $in: objectIds } })
    .lean()
    .exec();
  // Map back to original input order
  const resultMap = new Map<string, any>(updatedDocs.map((doc) => [doc._id.toString(), doc]));
  // Ensure the result array matches the input order
  const orderedResults = data.map((item) => {
    const updated = resultMap.get(item.id);
    return updated || { _id: item.id };
  });
  return orderedResults as Partial<I${capitalizedResourceName}>[];
};

/**
 * Service function to delete a single ${resourceName} by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the ${resourceName} to delete.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The deleted ${resourceName}.
 */
const delete${capitalizedResourceName} = async (id: IdOrIdsInput['id']): Promise<Partial<I${capitalizedResourceName} | null>> => {
  const deleted${capitalizedResourceName} = await ${capitalizedResourceName}Model.findByIdAndDelete(id);
  return deleted${capitalizedResourceName};
};

/**
 * Service function to delete multiple ${resourceName}.
 *
 * @param {IdOrIdsInput['ids']} ids - An array of IDs of ${resourceName} to delete.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The deleted ${resourceName}.
 */
const deleteMany${capitalizedResourceName} = async (ids: IdOrIdsInput['ids']): Promise<Partial<I${capitalizedResourceName}>[]> => {
  const ${resourceName}ToDelete = await ${capitalizedResourceName}Model.find({ _id: { $in: ids } });
  if (!${resourceName}ToDelete.length) throw new Error('No ${resourceName} found to delete');
  await ${capitalizedResourceName}Model.deleteMany({ _id: { $in: ids } });
  return ${resourceName}ToDelete; 
};

/**
 * Service function to retrieve a single ${resourceName} by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the ${resourceName} to retrieve.
 * @returns {Promise<Partial<I${capitalizedResourceName}>>} - The retrieved ${resourceName}.
 */
const get${capitalizedResourceName}ById = async (id: IdOrIdsInput['id']): Promise<Partial<I${capitalizedResourceName} | null>> => {
  const ${resourceName} = await ${capitalizedResourceName}Model.findById(id);
  return ${resourceName};
};

/**
 * Service function to retrieve multiple ${resourceName} based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering ${resourceName}.
 * @returns {Promise<Partial<I${capitalizedResourceName}>[]>} - The retrieved ${resourceName}
 */
const getMany${capitalizedResourceName} = async (query: SearchQueryInput): Promise<{ ${resourceName}s: Partial<I${capitalizedResourceName}>[]; totalData: number; totalPages: number }> => {
  const { searchKey = '', showPerPage = 10, pageNo = 1 } = query;
  // Build the search filter based on the search key
  const searchFilter = {
    $or: [
      // { fieldName: { $regex: searchKey, $options: 'i' } },
      // Add more fields as needed
    ],
  };
  // Calculate the number of items to skip based on the page number
  const skipItems = (pageNo - 1) * showPerPage;
  // Find the total count of matching ${resourceName}
  const totalData = await ${capitalizedResourceName}Model.countDocuments(searchFilter);
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalData / showPerPage);
  // Find ${resourceName} based on the search filter with pagination
  const ${resourceName}s = await ${capitalizedResourceName}Model.find(searchFilter)
    .skip(skipItems)
    .limit(showPerPage)
    .select(''); // Keep/Exclude any field if needed
  return { ${resourceName}s, totalData, totalPages };
};

export const ${resourceName}Services = {
  create${capitalizedResourceName},
  createMany${capitalizedResourceName},
  update${capitalizedResourceName},
  updateMany${capitalizedResourceName},
  delete${capitalizedResourceName},
  deleteMany${capitalizedResourceName},
  get${capitalizedResourceName}ById,
  getMany${capitalizedResourceName},
};
    `;
      // Path to the service file
      const serviceFilePath = path.join(serviceDir, `${args[0]}.service.ts`);

      // Function to format file paths relative to project root
      const formatPath = (filePath) => path.relative(path.join(__dirname, '..'), filePath);

      // Create the resource directories if they don't exist
      [routeDir, controllerDir, modelsDir, interfaceDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      // Function to generate expected files based on the module name
      function getExpectedFiles(moduleName) {
        return [
          `${moduleName}.controller.ts`,
          `${moduleName}.interface.ts`,
          `${moduleName}.model.ts`,
          `${moduleName}.route.ts`,
          `${moduleName}.service.ts`,
          `${moduleName}.validation.ts`,
        ];
      }

      // Function to ask questions in the command line
      function askQuestion(rl, question) {
        return new Promise((resolve) => {
          rl.question(question, resolve);
        });
      }

      // Function to search the search files and create theme
      async function searchFile(dir, moduleName) {
        const files = fs.readdirSync(dir);
        const capitalizedResourceName = capitalize(moduleName);

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        try {
          for (const module of files) {
            const modulePath = path.join(dir, module);

            if (module === moduleName) {
              const stat = fs.statSync(modulePath);

              if (stat.isDirectory()) {
                const foundFiles = fs.readdirSync(modulePath);
                const expectedFiles = getExpectedFiles(moduleName);
                const missingFiles = expectedFiles.filter((file) => !foundFiles.includes(file));

                if (missingFiles.length === 0) {
                  console.log(`${RED}${capitalizedResourceName} module already exists.${RESET}`);
                } else if (missingFiles.length > 0 && missingFiles.length < expectedFiles.length) {
                  console.log(
                    `${GREEN}${capitalizedResourceName} ${RESET}module exists, but some files are missing:`
                  );
                  missingFiles.forEach((file, index) =>
                    console.log(`${GREEN}${index + 1}. ${file}${RESET}`)
                  );

                  const answer = await askQuestion(
                    rl,
                    `${BLUE}Do you want to create missing files one by one (Yes/Y) or all at once (Create/C)?${RESET} Enter (Yes/Y) or (Create/C): `
                  );

                  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                    for (const file of missingFiles) {
                      const createFile = await askQuestion(
                        rl,
                        `${BLUE}Do you want to create ${GREEN}${file}?${RESET} (yes/no) `
                      );
                      if (createFile.toLowerCase() === 'yes' || createFile.toLowerCase() === 'y') {
                        await createSingleFile(modulePath, file, moduleName);
                      }
                    }
                  } else if (answer.toLowerCase() === 'create' || answer.toLowerCase() === 'c') {
                    await createAllFiles(modulePath, missingFiles, moduleName);
                  } else {
                    console.log(`${RED}Invalid option. No files will be created.${RESET}`);
                  }
                } else {
                  await createAllFiles(modulePath, missingFiles, moduleName);
                }

                return true;
              }
            }
          }
          return false;
        } finally {
          rl.close();
        }
      }

      // Function to create single resource file
      async function createSingleFile(modulePath, file, moduleName) {
        const filePath = path.join(modulePath, file);
        let content;

        switch (file) {
          case `${moduleName}.route.ts`:
            content = routeContent;
            break;
          case `${moduleName}.controller.ts`:
            content = controllerContent;
            break;
          case `${moduleName}.model.ts`:
            content = modelContent;
            break;
          case `${moduleName}.interface.ts`:
            content = interfaceContent;
            break;
          case `${moduleName}.validation.ts`:
            content = validationContent;
            break;
          case `${moduleName}.service.ts`:
            content = serviceContent;
            break;
        }

        fs.writeFileSync(filePath, content.trim());
        console.log(
          `${GREEN}CREATE ${RESET}${formatPath(filePath)} ${BLUE}(${Buffer.byteLength(content, 'utf8')} bytes)${RESET}`
        );
      }

      // Function to create all resources files
      async function createAllFiles(modulePath, missingFiles, moduleName) {
        for (const file of missingFiles) {
          await createSingleFile(modulePath, file, moduleName);
        }
      }

      // Entry point
      (async () => {
        const moduleName = args[0];
        const srcPath = path.join(process.cwd(), 'src', 'modules');

        if (!moduleName) {
          console.log(`${RED}Please provide a module name.${RESET}`);
          return;
        }

        const found = await searchFile(srcPath, moduleName);
        if (!found) {
          console.log(`${RED}Module ${moduleName} not found.${RESET}`);
        }
      })();
    });
  program.parse(['node', 'cli.js'].concat(args));
} else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
