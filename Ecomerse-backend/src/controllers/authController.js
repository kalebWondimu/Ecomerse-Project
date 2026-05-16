const jwt = require('jsonwebtoken');
const { User } = require('../models');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const { Op } = require('sequelize');

const generateToken = (id, expires = '1h', type = 'auth') => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: expires });
};



exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;   
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = await User.create({ 
      name, 
      email, 
      password,
      phone: phone || null,
      isVerified: true
    });

    res.status(201).json({
      message: 'Registration successful. You can now log in.',
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (user && (await user.matchPassword(password))) {
      const authToken = generateToken(user.id, '1h', 'auth');
      const verifyToken = generateToken(user.id, '1d', 'verify');
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,  
        role: user.role,
        token: authToken,
        verifyToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
  
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }
    
    
    const resetToken = generateToken(user.id, '1h', 'reset');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    // Log reset link for testing/debugging
    console.log(`\n🔗 Password reset link for ${email}:`);
    console.log(`${resetUrl}`);
    console.log(`⏱️  Link expires in 1 hour\n`);
    
    try {
      await emailService.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
  
    }
    
    res.json({ 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Reset link has expired. Please request a new one.' });
      }
      return res.status(401).json({ message: 'Invalid reset link. Please request a new one.' });
    }
    
    if (decoded.type !== 'reset') {
      return res.status(400).json({ message: 'Invalid token type' });
    }
    
    const user = await User.findOne({
      where: {
        id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() } // Token not expired
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }
    

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    
    res.json({ message: 'Password updated successfully. You can now login with your new password.' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'No token provided' });
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
    
    if (decoded.type !== 'verify') {
      return res.status(400).json({ message: 'Invalid token type' });
    }
    
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isVerified = true;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }
    
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Clear OTP and mark as verified
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();
    
    // Send welcome email on first OTP verification
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (welcomeError) {
      console.error('Failed to send welcome email:', welcomeError);
    }

    // Generate auth token
    const authToken = generateToken(user.id, '1h', 'auth');
    
    res.json({
      message: 'Email verified successfully. Welcome to our store!',
      welcomeMessage: `Welcome to ${user.name}! Your account is now verified and ready to use.`,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: authToken,
      isVerified: true
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    
    // Log OTP for testing/debugging
    console.log(`\n🔐 OTP for ${email}: ${otp}`);
    console.log(`⏱️  OTP expires in 10 minutes\n`);
    
    // Send OTP via email
    try {
      await emailService.sendOTPVerificationEmail(email, otp);
      res.json({ message: 'OTP sent successfully. Please check your email.' });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: error.message });
  }
};