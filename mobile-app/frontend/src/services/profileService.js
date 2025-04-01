import apiClient from './apiClient';

const profileService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/api/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  updateVoice: async (voiceId) => {
    try {
      const response = await apiClient.put('/api/profile', { voice: voiceId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

export default profileService; 