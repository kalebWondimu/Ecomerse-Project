const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateTelebirrPayment,
  initiateChapPayment,
  initiateCBEPayment,
  telebirrCallback,
  chapaCallback,
  cbeCallback,
  verifyPayment,
} = require('../controllers/paymentController');

// Payment initiation endpoints (require authentication)
router.post('/telebirr/initiate', protect, initiateTelebirrPayment);
router.post('/chapa/initiate', protect, initiateChapPayment);
router.post('/cbe/initiate', protect, initiateCBEPayment);

// Payment callback endpoints (no auth required - called by payment gateways)
router.post('/telebirr/callback', telebirrCallback);
router.post('/chapa/callback', chapaCallback);
router.post('/cbe/callback', cbeCallback);

// Verify payment status
router.get('/verify/:transactionId', protect, verifyPayment);

module.exports = router;
