const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS  // Your Gmail App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
  } else {
  }
});

const emailService = {
  // Send password reset email
  sendPasswordResetEmail: async (email, resetToken) => {
    // Use your frontend URL - change this to your actual frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"E-Store Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - E-Store',
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
                    <h1>🔐 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your E-Store account. Click the button below to create a new password:</p>
                    
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
                    <p>&copy; ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Password Reset Request\n\nHello,\n\nWe received a request to reset your password. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  // Send welcome email (optional)
  sendWelcomeEmail: async (email, name) => {
    const mailOptions = {
      from: `"E-Store Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to E-Store!',
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
                    <h1>Welcome to E-Store, ${name}! 🎉</h1>
                </div>
                <div class="content">
                    <p>Thank you for joining E-Store! We're excited to have you on board.</p>
                    <p>Start exploring our amazing products and exclusive deals today!</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" 
                           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                            Start Shopping
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  // Send OTP verification email
  sendOTPVerificationEmail: async (email, otp) => {
    const mailOptions = {
      from: `"E-Store Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - E-Store',
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

                    <p class="warning">⚠️ If you didn't create an account with E-Store, please ignore this email.</p>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">

                    <p style="font-size: 14px;">For security, never share this code with anyone. Our team will never ask for your verification code.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} E-Store. All rights reserved.</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Email Verification\n\nHello,\n\nThank you for registering with E-Store! Your OTP verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't create an account, please ignore this email.`
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw error;
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
      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  }
};

module.exports = emailService;