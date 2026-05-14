const express = require('express');
const router = express.Router();
const { getSettings } = require('../controllers/adminController');

// Public store settings endpoint
router.get('/', getSettings);

module.exports = router;
