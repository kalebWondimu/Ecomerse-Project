const { User, Order, Product, StoreSettings } = require('../models');
const emailService = require('../services/emailService');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{
        model: Order,
        attributes: ['id', 'totalAmount', 'status', 'createdAt'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    const usersWithStats = users.map(user => {
      const userData = user.toJSON();
      const orders = userData.Orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        address: userData.address,
        role: userData.role,
        isVerified: userData.isVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        orderCount: orders.length,
        totalSpent: totalSpent,
        recentOrders: orders.slice(0, 3) 
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{
        model: User,
        attributes: ['id', 'name', 'email', 'phone'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
    
    const transformedOrders = orders.map(order => {
      const orderData = order.toJSON();
      
      return {
        ...orderData,
        user: orderData.User ? {
          id: orderData.User.id,
          name: orderData.User.name,
          email: orderData.User.email,
          phone: orderData.User.phone
        } : null
      };
    });
    
 
    
    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendBroadcastEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Check if user is super-admin
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can send broadcast emails' });
    }

    const result = await emailService.sendBroadcastEmail(subject, message);
    res.json({ success: true, message: 'Broadcast email sent successfully', result });
  } catch (error) {
    console.error('Broadcast email error:', error);
    res.status(500).json({ message: error.message || 'Failed to send broadcast email' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const totalProducts = await Product.count();
    
    const orders = await Order.findAll();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Get recent orders
    const recentOrders = await Order.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get top products 
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue
      },
      recentOrders,
      topProducts: products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to retrieve settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    // Check if user is super-admin
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can modify settings' });
    }

    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create({});
    }
    
    await settings.update(req.body);
    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    // Check if user is super-admin
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can create admins' });
    }

    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newAdmin = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      isVerified: true
    });

    const { password: _, ...adminData } = newAdmin.toJSON();
    res.status(201).json({ success: true, message: 'Admin created successfully', admin: adminData });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: error.message || 'Failed to create admin' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can update admins' });
    }

    const { adminId } = req.params;
    const { name, email, password, phone, role } = req.body;

    const admin = await User.findByPk(adminId);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super-admin')) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== admin.id) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password) updateData.password = password;
    if (role && ['admin', 'super-admin'].includes(role)) updateData.role = role;

    await admin.update(updateData);
    const { password: _, ...adminData } = admin.toJSON();
    res.json({ success: true, message: 'Admin updated successfully', admin: adminData });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: error.message || 'Failed to update admin' });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { 
        role: ['admin', 'super-admin'] 
      },
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'otp', 'otpExpires'] }
    });
    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Failed to retrieve admins' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    // Check if user is super-admin
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ message: 'Only super-admin can delete admins' });
    }

    const { adminId } = req.params;
    const admin = await User.findByPk(adminId);
    
    if (!admin || (admin.role !== 'admin' && admin.role !== 'super-admin')) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.role === 'super-admin') {
      return res.status(400).json({ message: 'Cannot delete super-admin' });
    }

    await admin.destroy();
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Failed to delete admin' });
  }
};