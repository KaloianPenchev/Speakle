import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

export default function useConversation(navigation, user) {
  const [conversationId, setConversationId] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    let gestureHandler = null;
    
    const setupConnection = async () => {
      try {
        SocketService.connect();
        
        SocketService.on('connect', () => {
          if (isMounted) setIsConnecting(false);
        });
        
        SocketService.on('connect_error', () => {
          if (isMounted) setIsConnecting(false);
        });
        
        gestureHandler = SocketService.on('gestureDetected', (data) => {
          if (isMounted) setRecognizedText(data.text);
        });
        
        await startConversation();
      } catch (error) {
        if (isMounted) setIsConnecting(false);
      }
    };
    
    setupConnection();
    
    return () => {
      isMounted = false;
      if (conversationId) {
        endConversation().catch(() => {});
      }
      
      if (gestureHandler) {
        gestureHandler();
      }
      
      SocketService.disconnect();
    };
  }, []);
  
  const startConversation = async () => {
    try {
      const userId = user?.id || await AsyncStorage.getItem('userId') || \nonymous-\\;
      
      if (!user?.id && !await AsyncStorage.getItem('userId')) {
        await AsyncStorage.setItem('userId', userId);
      }
      
      const result = await ApiService.startConversation(userId);
      
      if (result.success) {
        setConversationId(result.conversation.id);
      } else {
        Alert.alert('Error', 'Failed to start conversation. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Could not connect to conversation service. Continue anyway?',
        [
          { 
            text: 'Cancel', 
            onPress: () => navigation.goBack(), 
            style: 'cancel' 
          },
          { 
            text: 'Continue', 
            onPress: () => {} 
          }
        ]
      );
    }
  };
  
  const endConversation = async () => {
    try {
      if (!conversationId) return;
      await ApiService.endConversation(conversationId);
    } catch (error) {}
  };
  
  const handleCancelConversation = async () => {
    try {
      Alert.alert(
        'End Conversation',
        'Are you sure you want to end this conversation?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'End Conversation',
            onPress: async () => {
              try {
                if (conversationId) {
                  await endConversation().catch(() => {});
                }
                navigation.navigate('Home');
              } catch (error) {
                navigation.navigate('Home');
              }
            }
          }
        ]
      );
    } catch (error) {
      navigation.navigate('Home');
    }
  };
  
  return {
    recognizedText,
    isConnecting,
    endConversation,
    handleCancelConversation
  };
}
