const axios = require('axios');
require('dotenv').config();
const { StoreSettings } = require('../models');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const sendEmail = async (to, subject, htmlContent) => {
  if (!RESEND_API_KEY) {
    console.log('Resend API key not configured - email not sent');
    return false;
  }

  try {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

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
    console.error('Error sending email:', error.response?.data || error.message);
    return false;
  }
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
