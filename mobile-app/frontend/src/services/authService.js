import apiClient from './apiClient';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  signup: async (email, password, name, voice) => {
    try {      
      const voiceValue = Number(voice);
      const finalVoice = isNaN(voiceValue) ? 0 : voiceValue;
      
      const response = await apiClient.post('/api/auth/signup', { 
        email, 
        password, 
        name,
        voice: finalVoice 
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response) {
        throw new Error(`Signup failed with status ${error.response.status}`);
      } else {
        throw new Error('Network error during signup');
      }
    }
  },
  
  logout: async () => {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  validateToken: async () => {
    try {
      
      const response = await apiClient.get('/api/profile');
      return { valid: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        return { valid: false, reason: 'unauthorized' };
      }
      return { valid: false, reason: 'network_error' };
    }
  }
};

export default authService; 