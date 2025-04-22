import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadAuthToken = async () => {
  try {
    const sessionData = await AsyncStorage.getItem('user_session');
    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      const token = parsedData.token;
      
      console.log('Retrieved token from storage:', token ? 'Token exists' : 'No token found');
      
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
      }
    } else {
      console.log('No session data found in storage');
    }
    return false;
  } catch (error) {
    console.error('Error loading auth token:', error);
    return false;
  }
};

const profileService = {
  getProfile: async () => {
    try {
      const hasToken = await loadAuthToken();
      if (!hasToken) {
        console.error('No auth token available for profile request');
        throw new Error('Authentication required');
      }
      
      console.log('Making request to get user profile...');
      
      const response = await apiClient.get('/api/profile/');
      console.log('Profile data received:', response.data ? 'Data exists' : 'No data');
      
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error.response?.status || 'No status', 
        error.response?.data?.message || error.message || 'Unknown error');
      
      if (error.response?.status === 401) {
        throw { message: 'Authentication required. Please log in again.' };
      }
      
      throw error.response?.data || { message: 'Failed to fetch profile data' };
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const hasToken = await loadAuthToken();
      if (!hasToken) {
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.put('/api/profile/', profileData);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.status || 'No status', 
        error.response?.data?.message || error.message || 'Unknown error');
      
      throw error.response?.data || { message: 'Network error' };
    }
  },
  
  updateVoice: async (voiceId) => {
    try {
      const numericVoiceId = parseInt(voiceId, 10);
      
      const hasToken = await loadAuthToken();
      if (!hasToken) {
        throw new Error('Authentication token missing');
      }
      
      console.log('Updating voice preference to:', numericVoiceId);
      
      const response = await apiClient.post('/api/profile/voice', 
        { voice: numericVoiceId },
        { 
          timeout: 5000, // 5 second timeout
          retries: 1 
        }
      );
      
      
      await AsyncStorage.setItem('selectedVoice', voiceId.toString());
      
  
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
      
      console.log('Voice preference updated successfully');
      return response.data;
    } catch (error) {
      console.error('Voice update error:', error.response?.status || 'No status', 
        error.response?.data?.message || error.message || 'Unknown error');
      
     
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
      
      }
      
      if (error.response?.status === 401) {
        throw { message: 'Unauthorized access. Please log in again.' };
      }
      throw error.response?.data || { message: `Failed to update voice: ${error.message}` };
    }
  },
  
  updateLanguage: async (languageCode) => {
    try {
     
      const hasToken = await loadAuthToken();
      if (!hasToken) {
        throw new Error('Authentication token missing');
      }
      
      console.log('Updating language preference to:', languageCode);
      
      
      const response = await apiClient.post('/api/profile/language', 
        { language: languageCode },
        { 
          timeout: 5000,
          retries: 1 
        }
      );
      
      
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      
      console.log('Language preference updated successfully');
      return response.data;
    } catch (error) {
      console.error('Language update error:', error.response?.status || 'No status', 
        error.response?.data?.message || error.message || 'Unknown error');
      
      
      try {
        await AsyncStorage.setItem('selectedLanguage', languageCode);
      } catch (storageError) {
      }
      
      if (error.response?.status === 401) {
        throw { message: 'Unauthorized access. Please log in again.' };
      }
      throw error.response?.data || { message: `Failed to update language: ${error.message}` };
    }
  }
};

export default profileService; 