const { User, Order, Product } = require('../models');
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