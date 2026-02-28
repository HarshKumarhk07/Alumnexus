const sgMail = require('@sendgrid/mail');

/**
 * Send email using SendGrid REST API
 * @param {Object} params - { to, subject, html }
 * @returns {Promise<Boolean>} - true on success, false on failure
 */
const sendEmail = async ({ to, subject, html }) => {
    // Check if API key is provided
    if (!process.env.SENDGRID_API_KEY) {
        console.warn('WARNING: SENDGRID_API_KEY is missing. Email skipped.');
        return false;
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to,
        from: process.env.EMAIL_FROM || 'AlumNexus <noreply@alumnexus.com>',
        subject,
        html,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email successfully sent to ${to}`);
        return true;
    } catch (error) {
        console.error('SendGrid Error:', error.message);
        if (error.response) {
            console.error(error.response.body);
        }
        return false;
    }
};

module.exports = sendEmail;
