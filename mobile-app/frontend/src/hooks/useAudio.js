import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioService from '../services/AudioService';

export default function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        
        const savedVoice = await AsyncStorage.getItem('selectedVoice');
        const savedVoiceName = await AsyncStorage.getItem('voiceName');
        
        
        if (savedVoiceName) {
          setSelectedVoice(savedVoiceName);
        } 
        
        else if (savedVoice) {
          if (!isNaN(savedVoice)) {
            const voiceId = parseInt(savedVoice, 10);
            const voiceName = getVoiceNameById(voiceId);
            console.log(`Converting voice ID ${voiceId} to name: ${voiceName}`);
            setSelectedVoice(voiceName);
            
            await AsyncStorage.setItem('voiceName', voiceName);
          } else {
            
            setSelectedVoice(savedVoice);
          }
        }
      } catch (error) {
        console.error('Error loading audio settings:', error);
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
  
  const handleTTS = async (text) => {
    if (!text || isMuted) return;
    
    try {
      await AudioService.playTTS(text, selectedVoice);
    } catch (error) {
      Alert.alert('TTS Error', error.message);
    }
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const checkOpenAIConnectivity = async () => {
    try {
      const result = await AudioService.checkOpenAIConnectivity();
      

      return {
        success: result.success,
        message: result.success 
          ? `Connection successful!\n\nModels: \nTTS-1 Available: `
          : `Connection failed`
      };
    } catch (error) {
      console.error('OpenAI API Check Error:', error.message);
      return {
        success: false,
        message: `Error checking API: ${error.message}`
      };
    }
  };
  
  return {
    isMuted,
    selectedVoice,
    handleTTS,
    handleMuteToggle,
    checkOpenAIConnectivity
  };
}
