import api from './api';

const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const data = response.data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || 'user' 
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const data = response.data;
    
      if (data.token) {
        localStorage.setItem('token', data.token);

        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || 'user' 
        };
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
  
    if (response.data) {
      const user = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'user'
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get('/users/orders');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};

export default authService;