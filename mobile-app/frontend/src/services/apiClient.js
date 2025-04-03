import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log('API URL from env:', API_URL);

// Fallback to localhost if API_URL is not defined
const baseURL = API_URL || 'http://192.168.1.1:5000';
console.log('Using API base URL:', baseURL);

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    if (!config.retries) {
      config.retries = 0;
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    console.log(`API Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  async error => {
    console.error('API Error:', error.message);
    console.error('Failed request URL:', error.config?.url);
    
    const { config } = error;
    
    if (!config || config.retries === undefined) {
      return Promise.reject(error);
    }
    
    const isHtmlResponse = error.response && 
                          error.response.headers && 
                          error.response.headers['content-type'] && 
                          error.response.headers['content-type'].includes('text/html');
    
    const shouldRetry = 
      (error.response && (error.response.status >= 500 && error.response.status < 600)) || 
      !error.response ||
      isHtmlResponse;
    
    if (shouldRetry && config.retries > 0) {
      config.retries--;
      console.log(`Retrying request to ${config.url}, ${config.retries} attempts left`);
      
      const delay = 1000 * Math.pow(2, 3 - config.retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (error.response && error.response.status === 401) {
        try {
          const sessionData = await AsyncStorage.getItem('user_session');
          if (sessionData) {
            const { token } = JSON.parse(sessionData);
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (tokenError) {
          console.error('Token retrieval error:', tokenError);
        }
      }
      
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient; 