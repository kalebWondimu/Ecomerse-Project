const express = require('express');
const router = express.Router();
const { getUsers, getOrders, getStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/users', protect, admin, getUsers);
router.get('/orders', protect, admin, getOrders);
router.get('/stats', protect, admin, getStats);

module.exports = router;
