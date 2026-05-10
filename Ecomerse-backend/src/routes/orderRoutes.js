const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  cancelOrder 
} = require('../controllers/orderController');

// All routes require authentication
router.use(protect);

// GET /api/orders - Get all orders for user
// POST /api/orders - Create new order
router.get('/', getOrders);
router.post('/', createOrder);

// GET /api/orders/:id - Get single order
router.get('/:id', getOrderById);

// DELETE /api/orders/:id - Cancel order (user can cancel their own)
router.delete('/:id', cancelOrder);

// Admin only routes - COMMENTED OUT UNTIL WE FIX THE CONTROLLER
// router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;