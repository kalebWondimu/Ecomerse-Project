import api from './api';

const userService = {
  
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/users/orders');
    return response.data;
  }
};

export default userService;