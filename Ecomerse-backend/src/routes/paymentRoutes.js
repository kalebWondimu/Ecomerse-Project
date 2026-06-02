const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateChapPayment,
  chapaCallback,
  verifyPayment,
} = require('../controllers/paymentController');

// Payment initiation endpoint (requires authentication)
router.post('/chapa/initiate', protect, initiateChapPayment);

// Payment callback endpoint (no auth required - called by Chapa)
router.post('/chapa/callback', chapaCallback);

// Verify payment status
router.get('/verify/:transactionId', protect, verifyPayment);

module.exports = router;
