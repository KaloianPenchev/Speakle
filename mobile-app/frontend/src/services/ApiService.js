import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 
                Constants.manifest?.extra?.apiUrl || 
                process.env.EXPO_PUBLIC_API_URL || 
                'http://192.168.201.206:5000';

class ApiService {
  constructor() {
    console.log(`ApiService initialized with API_URL: ${API_URL}`);
  }

  async startConversation(userId) {
    try {
      const response = await fetch(`${API_URL}/api/conversation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  }
  
  async endConversation(conversationId) {
    try {
      const response = await fetch(`${API_URL}/api/conversation/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to end conversation: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }
  }
  
  async checkServerConnectivity() {
    try {
      console.log(`Checking server connectivity at ${API_URL}/api`);
      const response = await fetch(`${API_URL}/api`);
      return response.ok;
    } catch (error) {
      console.error('Server connectivity check failed:', error);
      return false;
    }
  }
  
  async login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return await response.json();
  }
  
  async signup(userData) {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }
    
    return await response.json();
  }
  
  async getUserProfile(userId) {
    const response = await fetch(`${API_URL}/api/profile/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.status}`);
    }
    
    return await response.json();
  }
  
  async updateUserProfile(userId, profileData) {
    const response = await fetch(`${API_URL}/api/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }
    
    return await response.json();
  }
}

export default new ApiService();