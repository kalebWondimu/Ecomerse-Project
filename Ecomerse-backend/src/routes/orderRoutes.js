const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  hideOrder,
  cancelOrder,
  updateOrderStatus 
} = require('../controllers/orderController');

// All routes require authentication
router.use(protect);

// GET /api/orders - Get all orders for user
// POST /api/orders - Create new order
router.get('/', getOrders);
router.post('/', createOrder);

// GET /api/orders/:id - Get single order
router.get('/:id', getOrderById);
router.put('/:id/hide', hideOrder);

// PUT /api/orders/:id/status - Admin can update order status
router.put('/:id/status', admin, updateOrderStatus);

// DELETE /api/orders/:id - Cancel order (user can cancel their own)
router.delete('/:id', cancelOrder);

module.exports = router;