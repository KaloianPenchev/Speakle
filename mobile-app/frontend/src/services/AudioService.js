import { Audio } from 'expo-av';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

class AudioService {
  
  async requestPermissions() {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  }
  
  async configureAudio() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });
  }
  
  async playTTS(text, voice) {
    if (!text) {
      throw new Error('No text provided for TTS');
    }
    
    const permissionGranted = await this.requestPermissions();
    if (!permissionGranted) {
      throw new Error('Audio permissions are required for text-to-speech');
    }
    
    await this.configureAudio();
    
    const sound = new Audio.Sound();
    
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
    
    try {
      const testResponse = await fetch(`${API_URL}/`);
      if (testResponse.status >= 400) {
        throw new Error(`Cannot connect to server at ${API_URL}`);
      }
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
    
    const ttsUrl = `${API_URL}/api/audio/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`;
    
    try {
      await sound.loadAsync({ 
        uri: ttsUrl,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      await sound.playAsync();
      return sound;
    } catch (error) {
      throw new Error(`Failed to play audio: ${error.message}`);
    }
  }
  
  async testTTS() {
    try {
      const testUrl = `${API_URL}/api/audio/test-tts`;
      
      try {
        const networkTest = await fetch(`${API_URL}/api`);
        if (networkTest.status >= 400) {
          throw new Error(`API server returned an error status: ${networkTest.status}`);
        }
      } catch (error) {
        throw new Error(`Cannot connect to server at ${API_URL}`);
      }
      
      const permissionGranted = await this.requestPermissions();
      if (!permissionGranted) {
        throw new Error('Audio playback requires microphone permissions');
      }
      
      await this.configureAudio();
      
      const sound = new Audio.Sound();
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      
      const audioFetchResponse = await fetch(testUrl);
      
      if (!audioFetchResponse.ok) {
        throw new Error(`Server returned status: ${audioFetchResponse.status}`);
      }
      
      await sound.loadAsync({ 
        uri: testUrl,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }, 
      { shouldPlay: false },
      true
      );
      
      const soundStatus = await sound.getStatusAsync();
      
      if (!soundStatus.isLoaded) {
        throw new Error('Failed to load audio');
      }
      
      await sound.playAsync();
      return sound;
    } catch (error) {
      throw error;
    }
  }
  
  async checkOpenAIConnectivity() {
    try {
      try {
        const testResponse = await fetch(`${API_URL}/api`);
        if (testResponse.status >= 400) {
          throw new Error(`API server returned an error status: ${testResponse.status}`);
        }
      } catch (error) {
        throw new Error(`Cannot connect to the API server at ${API_URL}`);
      }
      
      const response = await fetch(`${API_URL}/api/audio/check-openai`);
      
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return {
          success: data.success,
          modelCount: data.modelCount,
          hasRequiredModels: data.hasRequiredModels
        };
      } else {
        const text = await response.text();
        
        if (text.trim().startsWith('<')) {
          throw new Error('The server returned HTML instead of JSON');
        } else {
          throw new Error('The server returned a non-JSON response');
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new AudioService(); 