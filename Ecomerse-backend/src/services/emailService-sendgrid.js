const axios = require('axios');
require('dotenv').config();
const { StoreSettings } = require('../models');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@estore.com';

const sendEmail = async (to, subject, htmlContent) => {
  if (!SENDGRID_API_KEY) {
    console.log('SendGrid not configured - email not sent');
    return false;
  }

  try {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';
    const fromEmail = SENDGRID_FROM_EMAIL;

    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: {
          email: fromEmail,
          name: storeName,
        },
        content: [
          {
            type: 'text/html',
            value: htmlContent,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
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
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <p><a class="button" href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>${storeName} Team</p>
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
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp { font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Email Verification</h2>
          <p>Welcome to ${storeName}! Use the OTP below to verify your email address.</p>
          <p class="otp">${otp}</p>
          <p>This OTP will expire in 10 minutes.</p>
          <p>Best regards,<br>${storeName} Team</p>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Email Verification - ${storeName}`, htmlContent);
  },

  sendOrderConfirmationEmail: async (email, order) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .order-details { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Confirmation</h2>
          <p>Thank you for your order!</p>
          <div class="order-details">
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Amount:</strong> $${order.totalAmount}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <p>We'll notify you when your order is shipped.</p>
          <p>Best regards,<br>${storeName} Team</p>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Order Confirmation - ${storeName}`, htmlContent);
  },

  sendDeliveryEmail: async (email, orderNumber) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .success { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="success">✓ Your Order Has Been Delivered!</h2>
          <p>Order #${orderNumber} has been delivered successfully.</p>
          <p>Thank you for shopping with us!</p>
          <p>Best regards,<br>${storeName} Team</p>
        </div>
      </body>
      </html>
    `;

    return await sendEmail(email, `Delivery Confirmation - ${storeName}`, htmlContent);
  },

  sendBroadcastEmail: async (recipients, subject, message) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';

    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    try {
      const personalizations = recipients.map(email => ({
        to: [{ email }],
      }));

      await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations,
          subject: subject,
          from: {
            email: SENDGRID_FROM_EMAIL,
            name: storeName,
          },
          content: [
            {
              type: 'text/html',
              value: message,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✓ Broadcast email sent to ${recipients.length} recipients`);
      return true;
    } catch (error) {
      console.error('Broadcast email error:', error.response?.data || error.message);
      throw new Error('Failed to send broadcast email: ' + error.message);
    }
  },
};

module.exports = emailService;
