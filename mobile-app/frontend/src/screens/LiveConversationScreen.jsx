import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import AudioService from '../services/AudioService';
import ApiService from '../services/ApiService';
import SocketService from '../services/SocketService';

const LiveConversationScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [conversationId, setConversationId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // First try to get voice name directly (more reliable)
        const savedVoiceName = await AsyncStorage.getItem('voiceName');
        if (savedVoiceName) {
          console.log('Using saved voice name in conversation:', savedVoiceName);
          setSelectedVoice(savedVoiceName);
          return;
        }
        
        // Fall back to voice ID if needed
        const savedVoice = await AsyncStorage.getItem('selectedVoice');
        if (savedVoice) {
          if (!isNaN(savedVoice)) {
            const voiceId = parseInt(savedVoice, 10);
            const voiceName = getVoiceNameById(voiceId);
            console.log(`Converting voice ID ${voiceId} to name in conversation: ${voiceName}`);
            setSelectedVoice(voiceName);
            
            // Also save the voice name for future use
            await AsyncStorage.setItem('voiceName', voiceName);
          } else {
            setSelectedVoice(savedVoice);
          }
        }
      } catch (error) {
        console.error('Error loading conversation voice settings:', error);
      }
    };

    loadSettings();
  }, []);
  
  const getVoiceNameById = (voiceId) => {
    const voiceNames = {
      0: 'alloy',
      1: 'echo',
      2: 'fable',
      3: 'onyx',
      4: 'nova',
      5: 'shimmer'
    };
    return voiceNames[voiceId] || 'alloy';
  };
  
  useEffect(() => {
    let isMounted = true;
    let gestureHandler = null;
    
    const setupConnection = async () => {
      try {
        SocketService.connect();
        
        SocketService.on('connect', () => {
          if (isMounted) {
            setIsConnecting(false);
          }
        });
        
        SocketService.on('connect_error', () => {
          if (isMounted) {
            setIsConnecting(false);
            Alert.alert('Warning', 'Could not connect to gesture recognition system');
          }
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
      const userId = user?.id || await AsyncStorage.getItem('userId') || `anonymous-${Date.now()}`;
      
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
      
      const result = await ApiService.endConversation(conversationId);
    } catch (error) {
      // Silent error - don't block the user from leaving
    }
  };
  
  const handleTTS = async () => {
    if (!recognizedText || isMuted) return;
    
    try {
      await AudioService.playTTS(recognizedText, selectedVoice);
    } catch (error) {
      console.error('TTS Error:', error.message);
    }
  };
  
  const testTTS = async () => {
    try {
      await AudioService.testTTS();
      Alert.alert('TTS Test', 'Testing the Text-to-Speech function.');
    } catch (error) {
      Alert.alert('Test TTS Failed', `Error: ${error.message}`);
    }
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
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

  const checkOpenAIConnectivity = async () => {
    try {
      const result = await AudioService.checkOpenAIConnectivity();
      
      Alert.alert(
        'OpenAI API Check',
        result.success 
          ? `Connection successful!\n\nModels: ${result.modelCount}\nTTS-1 Available: ${result.hasRequiredModels ? 'Yes' : 'No'}`
          : `Connection failed`
      );
    } catch (error) {
      Alert.alert('OpenAI API Check Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <View style={styles.topSection}>
        <TouchableOpacity 
          style={[styles.ttsButton, { marginTop: 20 }]}
          onPress={handleTTS}
        >
          <Ionicons name="volume-high" size={40} color="white" />
        </TouchableOpacity>
        <Text style={styles.ttsHint}>Tap to speak recognized gesture</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollableMiddle}
        contentContainerStyle={styles.middleContentContainer}
      >
        {recognizedText ? (
          <View style={styles.textContainer}>
            <Text style={styles.recognizedText}>{recognizedText}</Text>
          </View>
        ) : (
          <Text style={styles.waitingText}>
            Waiting for gesture...
          </Text>
        )}
      </ScrollView>
      
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleMuteToggle}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={26} 
            color="#333"
          />
          <Text style={styles.buttonLabel}>
            {isMuted ? "Unmute" : "Mute"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.cancelButton]}
          onPress={handleCancelConversation}
        >
          <Ionicons name="close-circle" size={26} color="#FF3B30" />
          <Text style={[styles.buttonLabel, styles.cancelLabel]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSection: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    zIndex: 1,
  },
  scrollableMiddle: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  middleContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  bottomSection: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    zIndex: 1,
  },
  ttsButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ttsHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  textContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recognizedText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  waitingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 30,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 150,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFDDDD',
  },
  buttonLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  cancelLabel: {
    color: '#FF3B30',
  },
});

export default LiveConversationScreen; 