const axios = require('axios');
const { Order } = require('../models');

// Chapa Payment Integration
exports.initiateChapPayment = async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount || !email) {
      return res.status(400).json({
        message: 'orderId, amount, and email are required',
      });
    }

    const chapaApiKey = process.env.CHAPA_API_KEY;
    const chapaEndpoint = 'https://api.chapa.co/v1/transaction/initialize';

    if (!chapaApiKey) {
      return res.status(500).json({ message: 'Chapa API key is not configured' });
    }

    const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

    const txRef = `ORD-${String(orderId).padStart(6, '0')}-${Date.now()}`;
    const payload = {
      amount: amount,
      currency: 'ETB',
      email: email,
      first_name: 'Customer',
      last_name: 'Customer',
      phone_number: '',
      tx_ref: txRef,
      callback_url: `${backendUrl}/api/payments/chapa/callback`,
      return_url: `${frontendUrl}/order-confirmation/${orderId}`,
      customization: {
        title: 'E-commerce Order Payment',
        description: `Order #ORD-${orderId}`,
      },
    };

    // Some payment providers require integer amounts. Coerce to integer for testing.
    const originalAmount = payload.amount;
    if (!Number.isInteger(payload.amount)) {
      payload.amount = Math.round(Number(payload.amount));
      console.info(`Coerced Chapa amount from ${originalAmount} to ${payload.amount} for initialization`);
    }

    const chapaResponse = await axios.post(chapaEndpoint, payload, {
      headers: {
        Authorization: `Bearer ${chapaApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const chapaData = chapaResponse.data;
    if (!chapaData || chapaData.status !== 'success' || !chapaData.data) {
      console.error('Chapa initialization failed:', JSON.stringify(chapaData, null, 2));
      console.error('Request payload was:', JSON.stringify(payload, null, 2));
      return res.status(502).json({
        message: 'Failed to initialize Chapa payment',
        chapaStatus: chapaData?.status,
        chapaError: chapaData?.message || null,
        chapaData: chapaData?.data || null,
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }

    order.paymentStatus = 'pending';
    order.transactionId = txRef;
    await order.save();

    res.json({
      success: true,
      transactionId: txRef,
      checkoutUrl: chapaData.data.checkout_url,
      message: 'Redirect user to Chapa checkout URL',
    });
  } catch (error) {
    // Better error reporting for Axios errors coming from Chapa
    console.error('Chapa payment error:', error.message);
    if (error.response) {
      console.error('Chapa response status:', error.response.status);
      console.error('Chapa response data:', JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).json({
        message: 'Chapa API error',
        status: error.response.status,
        data: error.response.data,
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Payment Callback Handler

exports.chapaCallback = async (req, res) => {
  try {
    const txRef = req.body.tx_ref || req.body.reference || req.query.tx_ref || req.query.reference;
    const status = req.body.status || req.body.data?.status || req.query.status;

    if (status === 'success' && txRef) {
      const order = await Order.findOne({ where: { transactionId: txRef } });
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
      return res.json({ success: true, message: 'Payment confirmed' });
    }

    res.json({ success: false, message: 'Payment failed or not confirmed' });
  } catch (error) {
    console.error('Chapa callback error:', error);
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

    // Verify with Chapa API
    const chapaApiKey = process.env.CHAPA_API_KEY;
    const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${transactionId}`;

    if (chapaApiKey) {
      const verifyResponse = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer ${chapaApiKey}`,
        },
      });

      const verifyData = verifyResponse.data;
      if (verifyData?.status === 'success' && verifyData?.data?.status === 'success') {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
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
