const { Order, Cart, Product, User } = require('../models');
const emailService = require('../services/emailService');

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // prepare items array with price and product name
    const items = [];
    let totalAmount = 0;
    for (const i of cart.items) {
      const prod = await Product.findByPk(i.productId);
      if (prod) {
        items.push({
          productId: i.productId,
          productName: prod.name,
          quantity: i.quantity,
          price: prod.price,
        });
        totalAmount += i.quantity * prod.price;
      }
    }
    
    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      paymentMethod: req.body.paymentMethod,
      shippingAddress: req.body.shippingAddress,
    });
    
    // clear cart after creating order
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        userId: req.user.id,
        hiddenByCustomer: false,
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the user or user is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.hideOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.hiddenByCustomer = true;
    await order.save();

    res.json({ success: true, message: 'Order history hidden successfully' });
  } catch (error) {
    console.error('Hide order error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'email'],
        required: false
      }],
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = req.body.status;
    await order.save();

    if (
      req.body.status?.toLowerCase() === 'delivered' &&
      previousStatus?.toLowerCase() !== 'delivered'
    ) {
      try {
        if (order.User && order.User.email) {
          const productIds = order.items.map((item) => item.productId).filter(Boolean);
          const products = await Product.findAll({
            where: { id: productIds }
          });

          const itemsWithNames = order.items.map((item) => ({
            ...item,
            productName:
              item.productName ||
              products.find((product) => product.id === item.productId)?.name ||
              `Product #${item.productId}`,
          }));

          await emailService.sendOrderDeliveredEmail(
            order.User.email,
            order.id,
            itemsWithNames,
            order.totalAmount,
            order.shippingAddress,
          );
        }
      } catch (emailError) {
        console.error('Failed to send delivery notification email:', emailError);
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the current user OR user is admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }
    
    // Check if order can be cancelled (only pending/processing orders)
    if (!['pending', 'processing'].includes(order.status?.toLowerCase())) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: error.message });
  }
};