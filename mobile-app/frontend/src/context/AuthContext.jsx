import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, setAuthToken } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const SESSION_KEY = 'user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem(SESSION_KEY);
        
        if (sessionData) {
          const { user, token } = JSON.parse(sessionData);
          setUser(user);
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error loading stored session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  const storeSession = async (userData, token) => {
    try {
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user: userData, token })
      );
    } catch (error) {
      console.error('Error storing session:', error);
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

  const signup = async (email, password, username) => {
    try {
      return await authService.signup(email, password, username);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem(SESSION_KEY);
      setUser(null);
      setAuthToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 