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
        if (savedVoice) {
          if (!isNaN(savedVoice)) {
            const voiceId = parseInt(savedVoice, 10);
            setSelectedVoice(getVoiceNameById(voiceId));
          } else {
            setSelectedVoice(savedVoice);
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
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
      
      Alert.alert(
        'OpenAI API Check',
        result.success 
          ? \✅ Connection successful!\n\nModels: \\nTTS-1 Available: \\
          : \❌ Connection failed\
      );
    } catch (error) {
      Alert.alert('OpenAI API Check Error', error.message);
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
