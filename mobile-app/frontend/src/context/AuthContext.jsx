import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authService, setAuthToken } from '../services';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const SESSION_KEY = 'user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem(SESSION_KEY);
        
        if (sessionData) {
          const { user, token } = JSON.parse(sessionData);
          setUser(user);
          setAuthToken(token);
          
          // Verify if token is valid and refresh it if needed
          try {
            const response = await authService.validateToken();
            if (response && response.valid) {
              console.log('Token validation successful');
            }
          } catch (error) {
            console.warn('Token validation failed, will need to re-login');
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  const storeSession = async (userData, token) => {
    try {
      // Store the session data in AsyncStorage
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user: userData, token })
      );
      
      // Also store user data separately for easier access
      if (userData && userData.id) {
        await AsyncStorage.setItem('userId', userData.id.toString());
      }
      
      // If user has voice preference, store it
      if (userData && userData.voice !== undefined) {
        await AsyncStorage.setItem('selectedVoice', userData.voice.toString());
      }
    } catch (error) {
      console.error('Session storage error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const { user, session } = await authService.login(email, password);
      setUser(user);
      setAuthToken(session.access_token);
      await storeSession(user, session.access_token);
      return { user };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, name, voice = 0) => {
    try {
      setIsLoading(true);
      
      const voiceValue = Number(voice);
      const finalVoice = isNaN(voiceValue) ? 0 : voiceValue;
      
      const response = await authService.signup(email, password, name, finalVoice);
      
      if (response.session && response.user) {
        const userData = {
          ...response.user,
          username: name,
        };
        
        setUser(userData);
        setAuthToken(response.session.access_token);
        await storeSession(userData, response.session.access_token);
        return { user: userData };
      }
      
      try {
        const { user, session } = await authService.login(email, password);
        if (user) {
          user.username = name;
        }
        setUser(user);
        setAuthToken(session.access_token);
        await storeSession(user, session.access_token);
        return { user, signupData: response };
      } catch (loginError) {
        return { signupData: response, loginFailed: true };
      }
    } catch (error) {
      let errorMessage = 'Failed to create account';
      
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
      setAuthToken(null);
    } catch (error) {
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
      setAuthToken(null);
    }
  };

  const value = {
    user,
    loading,
    isLoading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 