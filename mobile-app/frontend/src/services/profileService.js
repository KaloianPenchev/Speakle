import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set the auth token from AsyncStorage if available
const loadAuthToken = async () => {
  try {
    const sessionData = await AsyncStorage.getItem('user_session');
    if (sessionData) {
      const { token } = JSON.parse(sessionData);
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

const profileService = {
  getProfile: async () => {
    try {
      // Ensure token is loaded
      await loadAuthToken();
      
      const response = await apiClient.get('/api/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      // Ensure token is loaded
      await loadAuthToken();
      
      const response = await apiClient.put('/api/user', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  updateVoice: async (voiceId) => {
    try {
      // Ensure we're working with a number
      const numericVoiceId = parseInt(voiceId, 10);
      
      // Ensure token is loaded before making the request
      const hasToken = await loadAuthToken();
      if (!hasToken) {
        throw new Error('Authentication token missing');
      }
      
      // Instead of using PUT, use POST with the specific endpoint for voice updates
      const response = await apiClient.post('/api/user/voice', 
        { voice: numericVoiceId },
        { 
          timeout: 5000, // 5 second timeout
          retries: 1 
        }
      );
      
      // Also save to local storage regardless of API success
      await AsyncStorage.setItem('selectedVoice', voiceId.toString());
      
      // Save the voice name too
      const voiceNames = {
        0: 'alloy',
        1: 'echo',
        2: 'fable',
        3: 'onyx',
        4: 'nova',
        5: 'shimmer'
      };
      const voiceName = voiceNames[numericVoiceId] || 'alloy';
      await AsyncStorage.setItem('voiceName', voiceName);
      
      return response.data;
    } catch (error) {
      // Save to local storage even if API fails
      try {
        await AsyncStorage.setItem('selectedVoice', voiceId.toString());
        const voiceNames = {
          0: 'alloy',
          1: 'echo',
          2: 'fable',
          3: 'onyx',
          4: 'nova',
          5: 'shimmer'
        };
        const voiceName = voiceNames[parseInt(voiceId, 10)] || 'alloy';
        await AsyncStorage.setItem('voiceName', voiceName);
      } catch (storageError) {
        // Silently handle storage errors
      }
      
      if (error.response?.status === 401) {
        throw { message: 'Unauthorized access. Please log in again.' };
      }
      throw error.response?.data || { message: `Failed to update voice: ${error.message}` };
    }
  }
};

export default profileService; 