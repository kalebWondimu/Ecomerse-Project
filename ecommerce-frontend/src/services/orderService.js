import api from './api';

const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  hideOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/hide`);
      return response.data;
    } catch (error) {
      console.error('Hide order error:', error);
      throw error;
    }
  }
};

export default orderService;