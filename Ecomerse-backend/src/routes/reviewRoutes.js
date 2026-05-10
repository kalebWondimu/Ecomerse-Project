const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addReply,
  editReply,
  deleteReply,
  moderateReview
} = require('../controllers/reviewController');

// Get reviews for a product (protected so we have user info)
router.get('/:productId', protect, getReviews);

// Review CRUD
router.post('/:productId', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Helpful
router.post('/:id/helpful', protect, markHelpful);

// Reply routes
router.post('/:id/reply', protect, addReply);
router.put('/:id/reply/:replyId', protect, editReply);
router.delete('/:id/reply/:replyId', protect, deleteReply);

// Admin moderation
//router.put('/:id/moderate', protect, admin, moderateReview);

module.exports = router;