import api from './api';

const paymentService = {
  initiateTelebirr: async (paymentData) => {
    try {
      const response = await api.post('/payments/telebirr/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Telebirr initiation error:', error);
      throw error;
    }
  },

  initiateChapa: async (paymentData) => {
    try {
      const response = await api.post('/payments/chapa/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Chapa initiation error:', error);
      throw error;
    }
  },

  initiateCBE: async (paymentData) => {
    try {
      const response = await api.post('/payments/cbe/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('CBE initiation error:', error);
      throw error;
    }
  },

  verifyPayment: async (transactionId) => {
    try {
      const response = await api.get(`/payments/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },
};

export default paymentService;
