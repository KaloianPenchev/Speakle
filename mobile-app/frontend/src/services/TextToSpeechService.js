import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

class TextToSpeechService {
  constructor() {
    this.sound = null;
    this.API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/audio/speech';
    this.API_KEY = null;
  }

  async initialize() {
    try {
      const storedApiKey = await AsyncStorage.getItem('openai_api_key');
      if (storedApiKey) {
        this.API_KEY = storedApiKey;
      }
      
      console.log('TextToSpeechService initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize TextToSpeechService:', error);
      return false;
    }
  }

  async setApiKey(apiKey) {
    this.API_KEY = apiKey;
    await AsyncStorage.setItem('openai_api_key', apiKey);
  }

  async speak(text, voiceId = 'alloy') {
    if (!text) {
      console.warn('Empty text provided to speak function');
      return false;
    }

    if (!this.API_KEY) {
      console.error('OpenAI API key not set');
      return false;
    }

    try {
      console.log(`Converting text to speech: "${text}"`);
      
      const fileName = `${Date.now()}_speech.mp3`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      const response = await axios.post(
        this.API_URL,
        {
          model: 'tts-1',
          input: text,
          voice: voiceId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`
          },
          responseType: 'arraybuffer'
        }
      );
      
      await FileSystem.writeAsStringAsync(
        fileUri, 
        arrayBufferToBase64(response.data),
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      
      await sound.playAsync();
      
      return true;
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      return false;
    }
  }

  async stop() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
    }
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default new TextToSpeechService(); 