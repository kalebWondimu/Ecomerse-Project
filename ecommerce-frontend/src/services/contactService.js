import api from './api';

const contactService = {
  sendContactMessage: async (payload) => {
    return api.post('/contact', payload);
  },
};

export default contactService;
