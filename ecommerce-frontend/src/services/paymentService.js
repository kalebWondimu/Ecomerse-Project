import api from './api';

const paymentService = {
  initiateChapa: async (paymentData) => {
    try {
      const response = await api.post('/payments/chapa/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Chapa initiation error:', error);
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
