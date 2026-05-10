import api from './api';

const reviewService = {
  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/reviews/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  addReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/reviews/${productId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  
  markHelpful: async (reviewId) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error('Error marking helpful:', error);
      throw error;
    }
  },

  addReply: async (reviewId, text) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/reply`, { text });
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  editReply: async (reviewId, replyId, text) => {
    try {
      const response = await api.put(`/reviews/${reviewId}/reply/${replyId}`, { text });
      return response.data;
    } catch (error) {
      console.error('Error editing reply:', error);
      throw error;
    }
  },

  
  deleteReply: async (reviewId, replyId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}/reply/${replyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }
};

export default reviewService;