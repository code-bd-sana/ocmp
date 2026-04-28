import { Router } from 'express';
import { submitContactForm } from './contact-form.controller';
import { validateContactForm } from './contact-form.validation';

// Initialize router
const router = Router();

/**
 * @route POST /api/v1/contact-form/submit
 * @description Submit a contact form (public endpoint - no authentication required)
 * @access Public
 */
router.post('/submit', validateContactForm, submitContactForm);

module.exports = router;
