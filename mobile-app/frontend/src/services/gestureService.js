import { Audio } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

class GestureService {
  constructor() {
    this.sound = null;
    this.apiBaseUrl = process.env.EXPO_PUBLIC_API_URL + '/api';
    this.lastPlayedGesture = null;
  }

  async speakCurrentGesture() {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/gesture/speak`);
      
      if (!response.data.speak) {
        console.log('No gesture to speak');
        return { success: false, message: 'No active gesture detected' };
      }
      
      const { audioBase64, gesture } = response.data;
      
      
      if (this.lastPlayedGesture === gesture) {
        console.log(`Gesture "${gesture}" already played`);
        return { success: false, message: 'Gesture already played', gesture };
      }
      
     
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }
      
      
      const fileName = `${Date.now()}_speech.mp3`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(
        fileUri,
        audioBase64,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      this.lastPlayedGesture = gesture;
      
      
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
          this.sound = null;
        }
      });
      
      return { success: true, gesture, isPlaying: true };
    } catch (error) {
      console.error('Error in speak current gesture:', error);
      return { success: false, error: error.message };
    }
  }
  
  resetLastPlayedGesture() {
    this.lastPlayedGesture = null;
  }

  async textToSpeech(text) {
    try {
      
      let speechText = text;
      if (text === 'hello') {
        speechText = 'Hello';
      } else if (text === 'my_name_is') {
        speechText = 'My name is';
      } else if (text === 'bye') {
        speechText = 'Goodbye';
      }
      
      
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }
      
      
      const response = await axios.post(`${this.apiBaseUrl}/tts/speak`, { text: speechText });
      
      if (response.data && response.data.audioBase64) {
        const fileName = `${Date.now()}_speech.mp3`;
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        
        await FileSystem.writeAsStringAsync(
          fileUri,
          response.data.audioBase64,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        
        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: true }
        );
        
        this.sound = sound;
        
        sound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            await sound.unloadAsync();
            this.sound = null;
          }
        });
        
        return true;
      } else {
        throw new Error('No audio data received from server');
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      return false;
    }
  }
}

export default new GestureService(); 