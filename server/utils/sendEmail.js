import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let cachedTransporter = null;

/**
 * Reusable utility to send transactional emails using Nodemailer.
 * 
 * @param {Object} options - Email sending options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.htmlContent - HTML template content for email body
 */
export const sendEmail = async ({ to, subject, htmlContent }) => {
  // Check if emails are enabled
  const emailEnabled = process.env.EMAIL_ENABLED === 'true';
  if (!emailEnabled) {
    console.log(`✉️ [Email Bypassed] EMAIL_ENABLED is set to false. Target: <${to}> | Subject: "${subject}"`);
    return { bypassed: true };
  }

  try {
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // Check if configuration credentials are valid or default placeholders
    const isMockOrPlaceholder = 
      !user || 
      !pass || 
      user.includes('your_smtp') || 
      pass.includes('your_smtp') ||
      host.includes('smtp.mailtrap.io') && user === 'your_username';

    let transporter;

    if (isMockOrPlaceholder) {
      if (process.env.NODE_ENV === 'development') {
        if (cachedTransporter) {
          transporter = cachedTransporter;
        } else {
          console.log('✉️ [Email Config] Missing or default SMTP credentials detected.');
          console.log('   Generating automated transient test SMTP account (Ethereal)...');
          try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
              host: testAccount.smtp.host,
              port: testAccount.smtp.port,
              secure: testAccount.smtp.secure,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            });
            cachedTransporter = transporter;
            console.log(`   Ethereal Test account generated successfully: ${testAccount.user}`);
          } catch (etherealErr) {
            console.error('❌ [Ethereal Account Failed] Falling back to console-only mock delivery.', etherealErr.message);
          }
        }
      }
    } else {
      // Connect to user's configured SMTP server
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for port 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER ? `"AutoCare Service Center" <${process.env.EMAIL_USER}>` : `"AutoCare Service Center" <no-reply@autocare.com>`,
      to,
      subject,
      html: htmlContent,
    };

    if (transporter) {
      console.log(`✉️ [Email Sending] Initiating delivery to <${to}>...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Email Dispatched] Message ID: ${info.messageId}`);
      
      // If we generated an Ethereal email, log the URL to preview the email in the console!
      if (isMockOrPlaceholder && process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`🔗 [Ethereal Preview URL] Open link to view this email: ${previewUrl}`);
      }
      return { success: true, messageId: info.messageId };
    } else {
      // If no transport was configured, we mock email delivery by logging to console
      console.log('\n========================================================================');
      console.log('✉️ [MOCK EMAIL DELIVERY]');
      console.log(`FROM: "AutoCare Service Center" <no-reply@autocare.com>`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log('CONTENT (HTML Summary):');
      // Strip HTML tags for readable console output
      const textSummary = htmlContent
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 300);
      console.log(`${textSummary}... [Read full template in emailTemplates.js]`);
      console.log('========================================================================\n');
      return { success: true, mocked: true };
    }
  } catch (error) {
    // Non-blocking error handling: Log failure but do not throw
    console.error(`❌ [Email Delivery Failed] Error sending to <${to}>:`, error.message);
    return { success: false, error: error.message };
  }
};
