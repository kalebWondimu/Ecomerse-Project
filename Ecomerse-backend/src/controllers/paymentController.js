const axios = require('axios');
const { Order } = require('../models');

// Telebirr Payment Integration
exports.initiateTelebirrPayment = async (req, res) => {
  try {
    const { orderId, amount, phoneNumber } = req.body;

    if (!orderId || !amount || !phoneNumber) {
      return res.status(400).json({ 
        message: 'orderId, amount, and phoneNumber are required' 
      });
    }

    // Telebirr API Configuration
    const telebirrConfig = {
      apiKey: process.env.TELEBIRR_API_KEY,
      apiSecret: process.env.TELEBIRR_API_SECRET,
      endpoint: 'https://api.telebirr.com/v1/payments',
    };

    if (!telebirrConfig.apiKey || !telebirrConfig.apiSecret) {
      return res.status(500).json({
        message: 'Telebirr configuration missing',
      });
    }

    // Create payment request
    const payload = {
      merchantId: process.env.TELEBIRR_MERCHANT_ID,
      orderId: `ORD-${String(orderId).padStart(6, '0')}`,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'ETB',
      phoneNumber: phoneNumber,
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/telebirr/callback`,
      returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
    };

    // In production, make actual API call
    // const response = await axios.post(telebirrConfig.endpoint, payload, {
    //   headers: {
    //     'Authorization': `Bearer ${telebirrConfig.apiKey}`,
    //     'Content-Type': 'application/json',
    //   }
    // });

    // For demo: return mock response
    const mockTransactionId = `TBR-${Date.now()}`;
    
    const order = await Order.findByPk(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }

    order.paymentStatus = 'pending';
    order.transactionId = mockTransactionId;
    await order.save();

    res.json({
      success: true,
      transactionId: mockTransactionId,
      message: 'Payment initiated. USSD prompt will be sent to ' + phoneNumber,
      paymentUrl: `https://telebirr.com/pay/${mockTransactionId}`, // Mock URL
    });
  } catch (error) {
    console.error('Telebirr payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Chapa Payment Integration
exports.initiateChapPayment = async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount || !email) {
      return res.status(400).json({
        message: 'orderId, amount, and email are required',
      });
    }

    const chapaConfig = {
      apiKey: process.env.CHAPA_API_KEY,
      endpoint: 'https://api.chapa.co/v1/transaction/initialize',
    };

    if (!chapaConfig.apiKey) {
      return res.status(500).json({
        message: 'Chapa configuration missing',
      });
    }

    const payload = {
      amount: amount,
      currency: 'ETB',
      email: email,
      first_name: 'Customer',
      phone_number: '0900000000',
      tx_ref: `ORD-${String(orderId).padStart(6, '0')}-${Date.now()}`,
      callback_url: `${process.env.BACKEND_URL}/api/payments/chapa/callback`,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
      customization: {
        title: 'E-commerce Order Payment',
        description: `Order #${orderId}`,
      },
    };

    // In production: make actual API call
    // const response = await axios.post(chapaConfig.endpoint, payload, {
    //   headers: {
    //     'Authorization': `Bearer ${chapaConfig.apiKey}`,
    //     'Content-Type': 'application/json',
    //   }
    // });

    // For demo: return mock response
    const mockCheckoutUrl = `https://checkout.chapa.co/${payload.tx_ref}`;
    
    const order = await Order.findByPk(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }

    order.paymentStatus = 'pending';
    order.transactionId = payload.tx_ref;
    await order.save();

    res.json({
      success: true,
      transactionId: payload.tx_ref,
      checkoutUrl: mockCheckoutUrl,
      message: 'Redirect user to checkout URL',
    });
  } catch (error) {
    console.error('Chapa payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// CBE Bank Payment Integration
exports.initiateCBEPayment = async (req, res) => {
  try {
    const { orderId, amount, accountNumber } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        message: 'orderId and amount are required',
      });
    }

    const cbeConfig = {
      apiKey: process.env.CBE_API_KEY,
      merchantCode: process.env.CBE_MERCHANT_CODE,
      endpoint: 'https://api.cbebirr.et/v1/payments',
    };

    if (!cbeConfig.apiKey || !cbeConfig.merchantCode) {
      return res.status(500).json({
        message: 'CBE configuration missing',
      });
    }

    const payload = {
      merchantCode: cbeConfig.merchantCode,
      orderId: `ORD-${String(orderId).padStart(6, '0')}`,
      amount: amount,
      currency: 'ETB',
      description: `E-commerce Order #${orderId}`,
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/cbe/callback`,
      returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
    };

    // In production: make actual API call
    // const response = await axios.post(cbeConfig.endpoint, payload, {
    //   headers: {
    //     'Authorization': `Bearer ${cbeConfig.apiKey}`,
    //     'Content-Type': 'application/json',
    //   }
    // });

    // For demo: return mock response
    const mockTransactionId = `CBE-${Date.now()}`;

    const order = await Order.findByPk(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }

    order.paymentStatus = 'pending';
    order.transactionId = mockTransactionId;
    await order.save();

    res.json({
      success: true,
      transactionId: mockTransactionId,
      bankDetails: {
        accountName: 'E-commerce Store',
        accountNumber: '1000234567890',
        bankCode: 'CBE',
        referenceNumber: payload.orderId,
        amount: amount,
        description: 'Transfer to complete your order',
      },
      message: 'Bank transfer details generated. Please complete the transfer and use the reference number above.',
    });
  } catch (error) {
    console.error('CBE payment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Payment Callback Handlers
exports.telebirrCallback = async (req, res) => {
  try {
    const { transactionId, status, orderId } = req.body;

    if (status === 'success') {
      const order = await Order.findOne({ where: { transactionId } });
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
      return res.json({ success: true, message: 'Payment confirmed' });
    }

    res.json({ success: false, message: 'Payment failed' });
  } catch (error) {
    console.error('Telebirr callback error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.chapaCallback = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (status === 'success') {
      const order = await Order.findOne({ where: { transactionId: tx_ref } });
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
      return res.json({ success: true, message: 'Payment confirmed' });
    }

    res.json({ success: false, message: 'Payment failed' });
  } catch (error) {
    console.error('Chapa callback error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.cbeCallback = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (status === 'success') {
      const order = await Order.findOne({ where: { transactionId } });
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
      return res.json({ success: true, message: 'Payment confirmed' });
    }

    res.json({ success: false, message: 'Payment failed' });
  } catch (error) {
    console.error('CBE callback error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Verify Payment Status
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const order = await Order.findOne({ where: { transactionId } });
    if (!order) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      transactionId,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      amount: order.totalAmount,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};
