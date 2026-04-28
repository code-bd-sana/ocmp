import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';

/**
 * Zod schema for validating contact form submission data.
 */
const zodContactFormSchema = z.object({
  fullName: z
    .string({ message: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z.string({ message: 'Email is required' }).email('Please provide a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d\s\-\+\(\)]+$/.test(val), 'Phone number is invalid'),
  subject: z
    .string({ message: 'Subject is required' })
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must not exceed 100 characters'),
  message: z
    .string({ message: 'Message is required' })
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must not exceed 2000 characters'),
});

export type ContactFormInput = z.infer<typeof zodContactFormSchema>;

/**
 * Named validator middleware for contact form submission
 */
export const validateContactForm = validateBody(zodContactFormSchema);
