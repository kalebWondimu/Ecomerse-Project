const express = require('express');
const router = express.Router();
const { getUsers, getOrders, getStats, sendBroadcastEmail, getSettings, updateSettings, createAdmin, getAdmins, updateAdmin, deleteAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/users', protect, admin, getUsers);
router.get('/orders', protect, admin, getOrders);
router.get('/stats', protect, admin, getStats);
router.post('/broadcast-email', protect, admin, sendBroadcastEmail);
router.get('/settings', protect, admin, getSettings);
router.put('/settings', protect, admin, updateSettings);
router.post('/admins', protect, admin, createAdmin);
router.get('/admins', protect, admin, getAdmins);
router.put('/admins/:adminId', protect, admin, updateAdmin);
router.delete('/admins/:adminId', protect, admin, deleteAdmin);

module.exports = router;
