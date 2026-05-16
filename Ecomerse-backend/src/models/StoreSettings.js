const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const StoreSettings = sequelize.define('StoreSettings', {
  storeName: {
    type: DataTypes.STRING,
    defaultValue: 'E-Store',
  },
  storeEmail: {
    type: DataTypes.STRING,
    defaultValue: 'contact@estore.com',
  },
  storePhone: {
    type: DataTypes.STRING,
    defaultValue: '+1 (555) 123-4567',
  },
  storeAddress: {
    type: DataTypes.STRING,
    defaultValue: '123 Commerce St, New York, NY 10001',
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'America/New_York',
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en',
  },
  paymentMethods: {
    type: DataTypes.JSON,
    defaultValue: [
      { id: 'stripe', name: 'Stripe', enabled: true, testMode: true },
      { id: 'paypal', name: 'PayPal', enabled: true, testMode: true },
      { id: 'cod', name: 'Cash on Delivery', enabled: false, testMode: false },
    ],
  },
  shippingMethods: {
    type: DataTypes.JSON,
    defaultValue: [
      { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7', enabled: true },
      { id: 'express', name: 'Express Shipping', price: 14.99, days: '2-3', enabled: true },
      { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1', enabled: false },
    ],
  },
  emailSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      orderConfirmation: true,
      shippingConfirmation: true,
      passwordReset: true,
      welcomeEmail: true,
      newsletterEnabled: true,
      adminNotifications: true,
      lowStockAlerts: true,
      emailSignature: 'The E-Store Team',
      welcomeMessageTitle: 'Welcome to {storeName}, {userName}! 🎉',
      welcomeMessageBody: 'Thank you for joining {storeName}! We\'re excited to have you on board.',
      passwordResetMessageTitle: '🔐 Password Reset Request',
      passwordResetMessageBody: 'We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour for security reasons.',
      orderDeliveredMessageTitle: 'Your Order #{orderId} Has Been Delivered',
      orderDeliveredMessageBody: 'Good news! Your order has been marked as delivered. Here are the items included in your shipment.',
    },
  },
  securitySettings: {
    type: DataTypes.JSON,
    defaultValue: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      ipWhitelist: [],
    },
  },
}, { timestamps: true });

module.exports = StoreSettings;
