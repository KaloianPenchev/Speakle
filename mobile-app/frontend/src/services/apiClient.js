import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.error('EXPO_PUBLIC_API_URL is not defined in environment');
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  config => {
    if (!config.retries) {
      config.retries = 0;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
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
          console.error('Error refreshing token during retry:', tokenError);
        }
      }
      
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

(async () => {
  try {
    await apiClient.get('/api');
    console.log('API connection successful');
  } catch (error) {
    console.warn('API connection failed - check backend server');
  }
})();

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient; 