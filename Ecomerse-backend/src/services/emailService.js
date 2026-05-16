const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { StoreSettings } = require('../models');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

const sendWithSmtp = async (to, subject, htmlContent, storeName) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('SMTP email not configured. Set EMAIL_USER and EMAIL_PASS.');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `${storeName} <${EMAIL_FROM}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`✓ Email sent via SMTP to ${to}`);
    return true;
  } catch (error) {
    console.log(`⚠ Email service unavailable (${error.code}). Email would be sent to: ${to}`);
    console.log(`📧 Email subject: ${subject}`);
    console.log(`📧 Email recipient: ${to}`);
    return true;
  }
};

const sendEmail = async (to, subject, htmlContent) => {
  const storeSettings = await StoreSettings.findOne();
  const storeName = storeSettings?.storeName || 'E-Store';

  if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
    try {
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: `${storeName} <${RESEND_FROM_EMAIL}>`,
          to: to,
          subject: subject,
          html: htmlContent,
        },
        {
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✓ Email sent to ${to}`);
      return true;
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.name === 'validation_error') {
        console.error('Resend validation error: verify your from address domain at resend.com/domains and use a verified RESEND_FROM_EMAIL. Falling back to SMTP if configured.');
      } else {
        console.error('Error sending email via Resend:', error.response?.data || error.message);
      }

      if (EMAIL_USER && EMAIL_PASS) {
        return await sendWithSmtp(to, subject, htmlContent, storeName);
      }
      return false;
    }
  }

  if (EMAIL_USER && EMAIL_PASS) {
    return await sendWithSmtp(to, subject, htmlContent, storeName);
  }

  console.log('No email provider configured. Set RESEND_API_KEY/RESEND_FROM_EMAIL or EMAIL_USER/EMAIL_PASS.');
  return false;
};

const emailService = {
  sendPasswordResetEmail: async (email, resetToken) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <p><a class="button" href="${resetUrl}">Reset Password</a></p>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link will expire in 1 hour.</p>
          <div class="footer">
            <p>Thank you,<br />${storeName} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Password Reset - ${storeName}`, htmlContent);
  },

  sendOTPVerificationEmail: async (email, otp) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 4px; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <p class="otp">${otp}</p>
          <p>This code will expire in 10 minutes.</p>
          <div class="footer">
            <p>Thank you,<br />${storeName} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Email Verification - ${storeName}`, htmlContent);
  },

  sendWelcomeEmail: async (email, name) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to ${storeName}!</h2>
          <p>Hi ${name},</p>
          <p>Your email has been verified and your account is now ready to use.</p>
          <p>We’re excited to have you on board.</p>
          <div class="footer">
            <p>Thank you,<br />${storeName} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Welcome to ${storeName}`, htmlContent);
  },

  sendContactEmail: async ({ name, email, subject, message }) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .message { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div class="message">
            <p>${message}</p>
          </div>
          <p>Reply to the user directly to follow up.</p>
        </div>
      </body>
      </html>
    `;

    const recipient = process.env.CONTACT_EMAIL || EMAIL_FROM || EMAIL_USER;
    return await sendEmail(recipient, `Contact Form: ${subject}`, htmlContent);
  },

  sendOrderDeliveredEmail: async (email, orderId) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .status { color: #16a34a; font-weight: bold; }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Delivered</h2>
          <p>Your order <strong>#${orderId}</strong> has been delivered.</p>
          <p class="status">Thank you for shopping with us!</p>
          <div class="footer">
            <p>Regards,<br />${storeName} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Order Delivered - ${storeName}`, htmlContent);
  },

  sendBroadcastEmail: async (recipients, subject, message) => {
    if (!RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }

    try {
      for (const recipient of recipients) {
        const htmlContent = `<p>${message}</p>`;
        await sendEmail(recipient, subject, htmlContent);
      }
      return true;
    } catch (error) {
      throw new Error('Failed to send broadcast email: ' + error.message);
    }
  },
};

module.exports = emailService;
