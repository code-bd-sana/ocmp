import SendEmail from '../../utils/email/send-email';
import config from '../../config/config';
import { ContactFormInput } from './contact-form.validation';

/**
 * Service function to handle contact form submission.
 * Sends an email notification to the admin about the contact form submission.
 *
 * @param {ContactFormInput} data - The contact form data from the user
 * @returns {Promise<boolean>} - Returns true if email was sent successfully
 */
const submitContactForm = async (data: ContactFormInput): Promise<boolean> => {
  try {
    // Send contact requests to the configured admin recipient.
    const adminEmail = config.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new Error('Admin email is not configured');
    }

    // Generate HTML email content with OCMP branding
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with OCMP branding -->
          <div style="background-color: #044192; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">OCMP</h1>
            <p style="color: #ffffff; margin: 5px 0 0; font-size: 14px;">Operations Control Management Platform</p>
            <p style="color: #e0e0e0; margin: 10px 0 0; font-size: 13px;">New Contact Form Submission</p>
          </div>

          <!-- Content -->
          <div style="padding: 25px; background-color: #ffffff;">
            <h2 style="color: #044192; margin-top: 0; font-size: 20px;">Contact Form Submission</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #044192;">
              <p style="margin: 10px 0; color: #333;"><strong style="color: #044192;">From:</strong> ${data.fullName}</p>
              <p style="margin: 10px 0; color: #333;"><strong style="color: #044192;">Email:</strong> <a href="mailto:${data.email}" style="color: #044192; text-decoration: none;">${data.email}</a></p>
              ${data.phone ? `<p style="margin: 10px 0; color: #333;"><strong style="color: #044192;">Phone:</strong> ${data.phone}</p>` : ''}
              <p style="margin: 10px 0; color: #333;"><strong style="color: #044192;">Subject:</strong> ${data.subject}</p>
            </div>

            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #044192; font-weight: bold; margin: 0 0 10px;">Message:</p>
              <p style="color: #555; line-height: 1.6; white-space: pre-wrap; margin: 0;">${data.message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999;">
              <p style="margin: 0;">This is an automated message from the OCMP Contact Form.</p>
              <p style="margin: 5px 0 0;">Please respond directly to the provided email address.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Send email to admin
    const emailSent = await SendEmail({
      to: adminEmail,
      subject: `New Contact Form Submission: ${data.subject}`,
      text: `Contact Form Submission from ${data.fullName}\n\nEmail: ${data.email}\n${data.phone ? `Phone: ${data.phone}\n` : ''}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
      html: htmlContent,
    });

    // Also send a confirmation email to the user
    if (emailSent) {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #044192; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">OCMP</h1>
              <p style="color: #ffffff; margin: 5px 0 0; font-size: 14px;">Operations Control Management Platform</p>
            </div>

            <div style="padding: 25px; background-color: #ffffff;">
              <h2 style="color: #044192; margin-top: 0;">We've Received Your Message</h2>
              <p style="color: #555; line-height: 1.6;">Hi ${data.fullName},</p>
              <p style="color: #555; line-height: 1.6;">Thank you for contacting OCMP. We have received your message and will get back to you as soon as possible.</p>
              
              <div style="background-color: #f0f8ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #044192;">
                <p style="color: #044192; font-weight: bold; margin: 0;">Submission Details:</p>
                <p style="color: #555; margin: 10px 0; font-size: 14px;"><strong>Subject:</strong> ${data.subject}</p>
                <p style="color: #555; margin: 10px 0; font-size: 14px;"><strong>Received:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <p style="color: #555; line-height: 1.6;">We will review your inquiry and respond within 24-48 hours.</p>

              <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <p style="color: #555; margin: 0;">Best regards,<br><strong style="color: #044192;">OCMP Team</strong></p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Send confirmation to user (fire and forget)
      SendEmail({
        to: data.email,
        subject: 'We received your message | OCMP',
        text: `Thank you for contacting OCMP. We have received your message and will get back to you as soon as possible. Subject: ${data.subject}`,
        html: confirmationHtml,
      }).catch((err) => console.error('Failed to send confirmation email:', err));
    }

    return emailSent;
  } catch (error) {
    console.error('Contact form submission error:', error);
    throw error;
  }
};

export const contactFormServices = {
  submitContactForm,
};
