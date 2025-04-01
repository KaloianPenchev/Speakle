import apiClient from './apiClient';

const ttsService = {
  convertTextToSpeech: async (text, voice) => {
    try {
      const response = await apiClient.post('/api/tts', { text, voice });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

export default ttsService; 