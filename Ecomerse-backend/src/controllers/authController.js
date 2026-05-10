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
      phone: phone || null 
    });
    
   
    const authToken = generateToken(user.id, '1h', 'auth');
    const verifyToken = generateToken(user.id, '1d', 'verify');
  
    
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,  
      token: authToken,
      verifyToken,
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
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    
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