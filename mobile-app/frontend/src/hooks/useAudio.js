import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioService from '../services/AudioService';

export default function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  
  const handleTTS = async (text) => {
    if (!text || isMuted) return;
    
    try {
      await AudioService.playTTS(text);
    } catch (error) {
      Alert.alert('Audio Error', 'Failed to play audio. Please try again.');
    }
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  return {
    isMuted,
    handleTTS,
    handleMuteToggle
  };
}
