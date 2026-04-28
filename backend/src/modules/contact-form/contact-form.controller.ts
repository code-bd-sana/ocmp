import { Request, Response } from 'express';
import { contactFormServices } from './contact-form.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { ContactFormInput } from './contact-form.validation';

/**
 * Controller function to handle contact form submissions.
 * This is a public endpoint that accepts contact form data and sends it to the admin.
 *
 * @param {Request} req - The request object containing contact form data in the body
 * @param {Response} res - The response object used to send the response
 * @returns {Promise<void>} - A promise that resolves when the contact form is processed
 * @throws {Error} - Throws an error if the contact form submission fails
 */
export const submitContactForm = catchAsync(async (req: Request, res: Response) => {
  const formData = req.body as ContactFormInput;

  // Call the service method to submit the contact form
  const emailSent = await contactFormServices.submitContactForm(formData);

  if (!emailSent) {
    throw new Error('Failed to send contact form email');
  }

  // Send a success response
  ServerResponse(res, true, 200, 'Thank you for contacting us! We will get back to you soon.');
});
