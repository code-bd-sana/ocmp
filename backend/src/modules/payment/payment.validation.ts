import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Payment Validation Schemas and Types
 *
 * This module defines Zod schemas for validating payment related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Zod schema for validating data when **creating** a single payment.
 *
 * → Add all **required** fields here
 */
const zodCreatePaymentSchema = z
  .object({
    // Example fields — replace / expand as needed:
    // name: z.string({ message: 'Payment name is required' }).min(2, 'Name must be at least 2 characters').max(100),
    // email: z.string().email({ message: 'Invalid email format' }),
    // age: z.number().int().positive().optional(),
    // status: z.enum(['active', 'inactive', 'pending']).default('pending'),
  })
  .strict();

export type CreatePaymentInput = z.infer<typeof zodCreatePaymentSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreatePayment = validateBody(zodCreatePaymentSchema);
