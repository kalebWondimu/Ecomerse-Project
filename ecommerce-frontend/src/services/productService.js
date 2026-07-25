import api from './api';

const productService = {
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      const payload = response.data;

      if (payload && Array.isArray(payload.products)) {
        return payload;
      }

      if (Array.isArray(payload)) {
        return {
          products: payload,
          totalCount: payload.length,
          currentPage: 1,
          totalPages: 1,
        };
      }

      return {
        products: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  },

  getProductsByCategory: async (category) => {
    const response = await api.get('/products', { params: { category } });
    return response.data.products || response.data;
  }
};

export default productService;