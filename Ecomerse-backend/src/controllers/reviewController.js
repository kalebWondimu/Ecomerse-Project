const { Review, Product, User } = require('../models');
const { sequelize } = require('../config/postgres');

// Add a new review
const addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findByPk(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = await Review.findOne({
      where: { 
        userId: req.user.id, 
        productId: req.params.productId 
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      userId: req.user.id,
      productId: req.params.productId,
      rating,
      title: title || null,
      comment,
      images: [],
      helpfulCount: 0,
      helpfulUsers: [],
      replies: [],
      verified: false,
      status: 'approved'
    });

    // Update product ratings
    const ratings = product.ratings || [];
    ratings.push(rating);
    product.ratings = ratings;
    product.calculateAverageRating();
    await product.save();

    // Fetch user details
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });

    const response = review.toJSON();
    response.user = user;

    res.status(201).json(response);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a product
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // Get the current user ID from the request
    const currentUserId = req.user ? req.user.id : null;
    
    // Transform the data
    const reviewsWithData = reviews.map(review => {
      const reviewData = review.toJSON();
      
      // Ensure replies is always an array
      reviewData.replies = reviewData.replies || [];
      
      // Check if current user has marked this review as helpful
      if (currentUserId) {
        reviewData.userHelpful = review.helpfulUsers?.includes(currentUserId) || false;
      } else {
        reviewData.userHelpful = false;
      }
      
      // Make sure the user object is properly structured
      if (reviewData.User) {
        reviewData.user = reviewData.User;
        delete reviewData.User;
      }
      
      return reviewData;
    });
    
    res.json(reviewsWithData);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { rating, title, comment } = req.body;
    
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    // Update product average rating
    const product = await Product.findByPk(review.productId);
    if (product) {
      const productReviews = await Review.findAll({
        where: { productId: review.productId }
      });
      const ratings = productReviews.map(r => r.rating);
      product.ratings = ratings;
      product.calculateAverageRating();
      await product.save();
    }

    res.json(review);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.productId;
    await review.destroy();

    // Update product average rating
    const product = await Product.findByPk(productId);
    if (product) {
      const productReviews = await Review.findAll({
        where: { productId }
      });
      const ratings = productReviews.map(r => r.rating);
      product.ratings = ratings;
      product.calculateAverageRating();
      await product.save();
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark review as helpful/unhelpful
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const helpfulUsers = review.helpfulUsers || [];
    let userHelpful = false;
    
    if (helpfulUsers.includes(req.user.id)) {
      // Remove helpful mark
      review.helpfulUsers = helpfulUsers.filter(id => id !== req.user.id);
      review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
      userHelpful = false;
    } else {
      // Add helpful mark
      review.helpfulUsers = [...helpfulUsers, req.user.id];
      review.helpfulCount = (review.helpfulCount || 0) + 1;
      userHelpful = true;
    }

    review.changed('helpfulUsers', true);
    review.changed('helpfulCount', true);
    await review.save();
    
    res.json({ 
      helpfulCount: review.helpfulCount,
      userHelpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add reply to review
const addReply = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    let replies = review.replies || [];
    if (!Array.isArray(replies)) {
      replies = [];
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email']
    });

    const newReply = {
      id: Date.now(),
      userId: req.user.id,
      userName: user.name,
      text: req.body.text,
      date: new Date().toISOString(),
      edited: false
    };

    replies.push(newReply);
    review.replies = replies;
    review.changed('replies', true);
    await review.save();

    res.status(201).json(newReply);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Edit a reply
const editReply = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { text } = req.body;
    const replyId = parseInt(req.params.replyId);
    const replies = review.replies || [];
    
    // Find the reply
    const replyIndex = replies.findIndex(r => r.id === replyId);
    
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user owns this reply or is admin
    if (replies[replyIndex].userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this reply' });
    }

    // Update the reply
    replies[replyIndex].text = text;
    replies[replyIndex].edited = true;
    replies[replyIndex].editedAt = new Date().toISOString();

    review.replies = replies;
    review.changed('replies', true);
    await review.save();

    res.json(replies[replyIndex]);
  } catch (error) {
    console.error('Edit reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a reply
const deleteReply = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const replyId = parseInt(req.params.replyId);
    const replies = review.replies || [];
    
    // Find the reply
    const replyIndex = replies.findIndex(r => r.id === replyId);
    
    if (replyIndex === -1) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user owns this reply or is admin
    if (replies[replyIndex].userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    // Remove the reply
    replies.splice(replyIndex, 1);
    review.replies = replies;
    review.changed('replies', true);
    await review.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Moderate review (admin only)
const moderateReview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const review = await Review.findByPk(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { action } = req.body;
    
    if (action === 'approve') {
      review.status = 'approved';
    } else if (action === 'reject') {
      review.status = 'rejected';
    }

    await review.save();
    
    res.json({ message: `Review ${action}d successfully` });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addReply,
  editReply,
  deleteReply,
  moderateReview
};