const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, verifyEmail, verifyOTP, resendOTP } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify/:token', verifyEmail);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

module.exports = router;
