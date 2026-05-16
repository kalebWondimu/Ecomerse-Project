const nodemailer = require('nodemailer');
require('dotenv').config();
const { StoreSettings } = require('../models');

// Create transporter
const createTransporter = async () => {
  const storeSettings = await StoreSettings.findOne();
  const authUser = process.env.EMAIL_USER || storeSettings?.storeEmail;

  if (!authUser || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be configured for SMTP transport');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: authUser,
      pass: process.env.EMAIL_PASS  // Your Gmail App Password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

let transporter;

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

const getEmailConfig = async () => {
  const storeSettings = await StoreSettings.findOne();
  const storeName = storeSettings?.storeName || 'E-Store';
  const storeEmail = storeSettings?.storeEmail || process.env.EMAIL_USER;
  const emailSignature = storeSettings?.emailSettings?.emailSignature || `${storeName} Team`;
  return { storeSettings, storeName, storeEmail, emailSignature };
};

const emailService = {
  // Send password reset email
  sendPasswordResetEmail: async (email, resetToken) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';
    const emailSignature = storeSettings?.emailSettings?.emailSignature || `${storeName} Team`;
    const resetTitle = storeSettings?.emailSettings?.passwordResetMessageTitle || '🔐 Password Reset Request';
    const resetBody = (storeSettings?.emailSettings?.passwordResetMessageBody || 'We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour for security reasons.')
      .replace('{storeName}', storeName);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"${storeName} Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - ' + storeName,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 8px 8px 0 0;
                    margin: -20px -20px 20px -20px;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    margin: 20px 0;
                }
                .button:hover {
                    opacity: 0.9;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #e0e0e0;
                }
                .warning {
                    color: #e53e3e;
                    font-size: 14px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${resetTitle}</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>${resetBody}</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #4299e1;">${resetUrl}</p>
                    
                    <p class="warning">⚠️ This link will expire in 1 hour for security reasons.</p>
                    
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                    
                    <p style="font-size: 14px;">For security, never share this link with anyone. Our team will never ask for your password.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                    <p>${emailSignature}</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Password Reset Request\n\nHello,\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\n${emailSignature}`
    };

    try {
      const transport = await getTransporter();
      const info = await transport.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Send welcome email (optional)
  sendWelcomeEmail: async (email, name) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';
    const emailSignature = storeSettings?.emailSettings?.emailSignature || `${storeName} Team`;
    const welcomeTitle = (storeSettings?.emailSettings?.welcomeMessageTitle || 'Welcome to {storeName}, {userName}! 🎉')
      .replace('{storeName}', storeName)
      .replace('{userName}', name);
    const welcomeBody = (storeSettings?.emailSettings?.welcomeMessageBody || 'Thank you for joining {storeName}! We\'re excited to have you on board.')
      .replace('{storeName}', storeName);
    
    const mailOptions = {
      from: `"${storeName} Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to ${storeName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 20px; background: #f9f9f9; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${welcomeTitle}</h1>
                </div>
                <div class="content">
                    <p>${welcomeBody}</p>
                    <p>Start exploring our amazing products and exclusive deals today!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" 
                           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Start Shopping
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                    <p>${emailSignature}</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    try {
      const transport = await getTransporter();
      const info = await transport.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  // Send OTP verification email
  sendOTPVerificationEmail: async (email, otp) => {
    const { storeName, emailSignature } = await getEmailConfig();
    const mailOptions = {
      from: `"${storeName} Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Verify Your Email - ${storeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 8px 8px 0 0;
                    margin: -20px -20px 20px -20px;
                }
                .header h1 {
                    color: white;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .otp-code {
                    text-align: center;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #667eea;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border: 2px dashed #667eea;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 12px;
                    border-top: 1px solid #e0e0e0;
                }
                .warning {
                    color: #e53e3e;
                    font-size: 14px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Email Verification</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Thank you for registering with E-Store! To complete your registration, please verify your email address using the OTP code below:</p>

                    <div class="otp-code">${otp}</div>

                    <p>This code will expire in 10 minutes for security reasons.</p>

                    <p class="warning">⚠️ If you didn't create an account with ${storeName}, please ignore this email.</p>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

                    <p style="font-size: 14px;">For security, never share this code with anyone. Our team will never ask for your verification code.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
                    <p>${emailSignature}</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Email Verification\n\nHello,\n\nThank you for registering with ${storeName}! Your OTP verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account, please ignore this email.\n\n${emailSignature}`
    };

    try {
      const transport = await getTransporter();
      const info = await transport.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending delivery email:', error);
      throw error;
    }
  },

  sendOrderDeliveredEmail: async (email, orderId, items, totalAmount, shippingAddress) => {
    const storeSettings = await StoreSettings.findOne();
    const storeName = storeSettings?.storeName || 'E-Store';
    const storeEmail = storeSettings?.storeEmail || process.env.EMAIL_USER;
    const emailSignature = storeSettings?.emailSettings?.emailSignature || `${storeName} Team`;
    const deliveredTitle = (storeSettings?.emailSettings?.orderDeliveredMessageTitle || 'Your Order #{orderId} Has Been Delivered')
      .replace('{orderId}', orderId);
    const deliveredBody = storeSettings?.emailSettings?.orderDeliveredMessageBody || 'Good news! Your order has been marked as delivered. Here are the items included in your shipment.';

    const mailOptions = {
      from: `"${storeName} Support" <${process.env.EMAIL_USER}>`,
      replyTo: storeEmail,
      to: email,
      subject: `Your Order #ORD-${orderId} Has Been Delivered`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1f2937; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; }
              .item { margin-bottom: 14px; }
              .footer { color: #6b7280; font-size: 12px; text-align: center; padding: 20px; }
              .badge { display: inline-block; margin-bottom: 12px; padding: 8px 14px; background: #10b981; color: white; border-radius: 9999px; font-weight: 600; }
              .table { width: 100%; border-collapse: collapse; margin-top: 16px; }
              .table th, .table td { padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
            </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${deliveredTitle}</h1>
            </div>
            <div class="content">
              <div class="badge">Delivered</div>
              <p>${deliveredBody}</p>
              <p>Order <strong>#ORD-${orderId}</strong></p>
              <p>Here are the items included in your shipment:</p>
              <table class="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${items
                    .map(
                      (item) => `
                        <tr>
                          <td>${item.productName || `Product #${item.productId}`}</td>
                          <td>${item.quantity}</td>
                          <td>$${(item.price || 0).toFixed(2)}</td>
                        </tr>
                      `,
                    )
                    .join('')}
                </tbody>
              </table>
              <p><strong>Total Paid:</strong> $${(totalAmount || 0).toFixed(2)}</p>
              <p><strong>Shipping Address:</strong></p>
              <p>${shippingAddress}</p>
              <p>If you have any questions or need assistance, reply to this email and we will help you.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with ${storeName}.</p>
              <p>${emailSignature}</p>
              <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Your order #ORD-${orderId} has been delivered.

Items:
${items
        .map(
          (item) => `- ${item.productName || `Product #${item.productId}`} x${item.quantity} - $${(item.price || 0).toFixed(2)}`,
        )
        .join('\n')}

Total Paid: $${(totalAmount || 0).toFixed(2)}

Shipping Address: ${shippingAddress}

If you have questions, reply to this email.

Thank you for shopping with ${storeName}.
${emailSignature}
`,
    };

    try {
      const transport = await getTransporter();
      const info = await transport.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending delivery email:', error);
      throw error;
    }
  },

  sendBroadcastEmail: async (subject, message) => {
    try {
      const { User } = require('../models');
      const allUsers = await User.findAll({
        where: { email: { [require('sequelize').Op.ne]: null } },
        attributes: ['email'],
      });

      const emailAddresses = allUsers
        .map((user) => user.email)
        .filter(Boolean);

      if (emailAddresses.length === 0) {
        throw new Error('No users with valid email addresses found.');
      }

      const transport = await getTransporter();
      // Verify transporter before sending
      await transport.verify();

      const { StoreSettings } = require('../models');
      const settings = await StoreSettings.findOne();
      const mailStoreName = settings?.storeName || 'E-Store';
      const emailSignature = settings?.emailSettings?.emailSignature || 'The E-Store Team';

      const mailOptions = {
        from: `"${mailStoreName} Admin" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        bcc: emailAddresses,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #222;">${subject}</h2>
            </div>
            <div style="line-height: 1.6; color: #555;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #999; margin: 0;">
              If you have any questions, reply to this email or contact support.
            </p>
            <p style="font-size: 12px; color: #999; margin: 0;">
              ${emailSignature}
            </p>
            <p style="font-size: 12px; color: #999; margin: 0;">
              &copy; ${new Date().getFullYear()} ${mailStoreName}. All rights reserved.
            </p>
          </div>
        `,
        text: `${subject}\n\n${message}\n\n${emailSignature}\n\n${new Date().getFullYear()} ${mailStoreName}. All rights reserved.`,
      };

      const info = await transport.sendMail(mailOptions);
      console.log('Broadcast email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId, recipientCount: emailAddresses.length };
    } catch (error) {
      console.error('Error sending broadcast email:', error);
      throw new Error(`Failed to send broadcast email: ${error.message}`);
    }
  },

  sendContactEmail: async ({ name, email, subject, message }) => {
    const supportEmail = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
    if (!supportEmail) {
      throw new Error('Support email address is not configured.');
    }

    const mailOptions = {
      from: `"E-Store Contact Form" <${process.env.EMAIL_USER}>`,
      to: supportEmail,
      replyTo: email,
      subject: `Contact form submission: ${subject}`,
      html: `
        <h2>New contact request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
      text: `New contact request\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
    };

    try {
      const transport = await getTransporter();
      const info = await transport.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  }
};

module.exports = emailService;