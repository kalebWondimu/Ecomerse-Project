const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateChapPayment,
  retryChapPayment,
  chapaCallback,
  verifyPayment,
  verifyPaymentPublic,
} = require('../controllers/paymentController');

// Payment initiation endpoint (requires authentication)
router.post('/chapa/initiate', protect, initiateChapPayment);
router.post('/chapa/retry', protect, retryChapPayment);

// Payment callback endpoint (no auth required - called by Chapa)
router.post('/chapa/callback', chapaCallback);

// Verify payment status for authenticated users
router.get('/verify/:transactionId', protect, verifyPayment);

// Public verification endpoint for return page
router.get('/verify-public/:transactionId', verifyPaymentPublic);

module.exports = router;
