const axios = require('axios');
const { Order, Product } = require('../models');

const getEtbAmount = (amount) => {
  const rate = Number(process.env.USD_TO_ETB_RATE || 161.5);
  return Number((Number(amount) * rate).toFixed(2));
};

const finalizeSuccessfulPayment = async (order) => {
  if (!order) return;

  order.paymentStatus = 'completed';
  order.status = 'processing';
  await order.save();

  if (!order.items?.length) return;

  for (const item of order.items) {
    const product = await Product.findByPk(item.productId);
    if (!product) continue;

    const requestedQty = Number(item.quantity || 0);
    if (product.stock < requestedQty) {
      product.stock = 0;
    } else {
      product.stock -= requestedQty;
    }
    await product.save();
  }
};

const markFailedPayment = async (order) => {
  if (!order) return;

  order.paymentStatus = 'failed';
  order.status = 'failed';
  await order.save();
};

// Chapa Payment Integration
exports.initiateChapPayment = async (req, res) => {
  try {
    const { orderId, amount, email, currency = 'USD' } = req.body;

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
    const requestedCurrency = String(currency || 'USD').toUpperCase();
    const chapaAmount = requestedCurrency === 'ETB'
      ? Number(amount)
      : getEtbAmount(amount);
    const payload = {
      amount: Number(chapaAmount.toFixed(2)),
      currency: 'ETB',
      email: email,
      first_name: 'Customer',
      last_name: 'Customer',
      phone_number: '',
      tx_ref: txRef,
      callback_url: `${backendUrl}/api/payments/chapa/callback`,
      // Use hash routing for the frontend app so the direct Chapa return URL resolves correctly.
      return_url: `${frontendUrl}/#/payment-result?tx_ref=${txRef}&orderId=${orderId}`,
      customization: {
        // Title must be <= 16 chars per Chapa API; description must not contain '#'
        title: 'Ecom Payment',
        description: `Order ORD-${orderId}`,
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
        await finalizeSuccessfulPayment(order);
      }
      return res.json({ success: true, message: 'Payment confirmed' });
    }

    if (txRef) {
      const order = await Order.findOne({ where: { transactionId: txRef } });
      if (order) {
        await markFailedPayment(order);
      }
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
        await finalizeSuccessfulPayment(order);
      } else {
        await markFailedPayment(order);
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

// Public verification endpoint for use by frontend return page (no auth required)
exports.verifyPaymentPublic = async (req, res) => {
  try {
    const { transactionId } = req.params;
    if (!transactionId) return res.status(400).json({ message: 'transactionId required' });

    const chapaApiKey = process.env.CHAPA_API_KEY;
    const verifyUrl = `https://api.chapa.co/v1/transaction/verify/${transactionId}`;

    if (!chapaApiKey) return res.status(500).json({ message: 'Chapa API key not configured' });

    const verifyResponse = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${chapaApiKey}` },
    });

    const verifyData = verifyResponse.data;
    const order = await Order.findOne({ where: { transactionId } });

    // Return sanitized verification result
    return res.json({
      transactionId,
      chapaStatus: verifyData?.status || 'failed',
      chapaData: verifyData?.data || null,
      amount: verifyData?.data?.amount || order?.totalAmount || null,
      currency: verifyData?.data?.currency || 'ETB',
      paymentStatus: order?.paymentStatus || null,
      orderStatus: order?.status || null,
    });
  } catch (error) {
    console.error('Public payment verification error:', error?.message || error);
    if (error.response) {
      return res.status(error.response.status).json({ message: 'Chapa verify error', data: error.response.data });
    }
    res.status(500).json({ message: error.message });
  }
};
