import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import apiClient from './apiClient';

class SpeechToTextService {
  constructor() {
    this.recording = null;
    this.hasPermission = false;
    this.isRecording = false;
    this.recordingInterval = null;
    this.onTranscriptionUpdate = null;
  }

  async requestPermissions() {
    try {
      console.log("Requesting microphone permissions...");
      const { status } = await Audio.requestPermissionsAsync();
      console.log("Permission status:", status);
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  async checkPermissions() {
    if (this.hasPermission) return true;
    return await this.requestPermissions();
  }

  setTranscriptionCallback(callback) {
    this.onTranscriptionUpdate = callback;
  }

  async startRecording() {
    console.log("Starting recording, checking permissions first...");
    if (!await this.checkPermissions()) {
      console.error("No microphone permissions");
      throw new Error('Microphone permission not granted');
    }

    try {
      console.log("Setting audio mode...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      if (this.recording) {
        console.log("Cleaning up previous recording...");
        try {
          if (this.isRecording) {
            await this.recording.stopAndUnloadAsync();
          } else {
            await this.recording.unloadAsync();
          }
        } catch (error) {
          console.error("Error cleaning up recording:", error);
          this.recording = null;
        }
      }

      console.log("Creating new recording...");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      this.recording = recording;
      console.log("Starting recording...");
      await this.recording.startAsync();
      this.isRecording = true;
      
      console.log("Starting transcription process...");
      this.startTranscribing();

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      this.isRecording = false;
      return false;
    }
  }

  async stopRecording() {
    console.log("Stopping recording...");
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    if (!this.recording || !this.isRecording) {
      console.log("No active recording to stop");
      return false;
    }
    
    try {
      console.log("Stopping and unloading recording...");
      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;
      
      const uri = this.recording.getURI();
      if (uri) {
        console.log("Transcribing final audio from:", uri);
        const result = await this.transcribeAudio(uri);
        if (result && this.onTranscriptionUpdate) {
          console.log("Final transcription result:", result.text);
          this.onTranscriptionUpdate(result.text);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error stopping recording:", error);
      this.isRecording = false;
      return false;
    }
  }

  startTranscribing() {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }
    
    console.log("Starting continuous transcription with 3-second intervals");
    
    this.recordingInterval = setInterval(async () => {
      if (!this.isRecording || !this.recording) {
        console.log("Stopping transcription interval - recording stopped");
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
        return;
      }
      
      try {
        const status = await this.recording.getStatusAsync();
        console.log(`Recording status: ${status.isDoneRecording ? 'Done' : 'Active'}, Duration: ${status.durationMillis}ms`);
        
        if (status.isDoneRecording) {
          console.log("Recording is done, stopping transcription interval");
          clearInterval(this.recordingInterval);
          this.recordingInterval = null;
          return;
        }
        
        if (status.durationMillis > 2000) {
          console.log("Recording duration > 2s, capturing audio chunk for transcription");
          const currentRecording = this.recording;

          console.log("Stopping current recording segment");
          await this.recording.stopAndUnloadAsync();
          
          const uri = currentRecording.getURI();
          if (uri) {
            console.log("Starting new recording segment");
            
            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            this.recording = newRecording;
            await this.recording.startAsync();

            console.log("Sending previous segment for transcription");
            this.transcribeAudio(uri).then(result => {
              if (result && this.onTranscriptionUpdate) {
                if (result.text && result.text.trim()) {
                  console.log("Received transcription text:", result.text);
                  this.onTranscriptionUpdate(result.text);
                } else {
                  console.log("Received empty transcription");
                }
              }
            });
          } else {
            console.warn("No URI available for the recording segment");
          }
        }
      } catch (error) {
        console.error("Error in transcription interval:", error);
      }
    }, 3000);
  }

  async transcribeAudio(audioUri, retryCount = 2) {
    try {
      console.log("Starting transcription for file:", audioUri);
      const info = await FileSystem.getInfoAsync(audioUri);
      if (!info.exists) {
        console.error("Audio file does not exist:", audioUri);
        throw new Error('Audio file does not exist');
      }

      console.log("Creating form data with file:", info.uri);
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'speech.m4a',
      });

      try {
        console.log("Making API request to /api/transcribe");
        const response = await apiClient.post('/api/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        });
        console.log("Transcription response:", response.data);
        return response.data;
      } catch (error) {
        console.error("API error:", error.message || error);
        
        if (retryCount > 0 && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
          console.log(`Retrying transcription (${retryCount} attempts left)...`);
          
          const delay = 1000 * Math.pow(2, 3 - retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));

          return this.transcribeAudio(audioUri, retryCount - 1);
        }

        if (this.onTranscriptionUpdate) {
          console.warn("All transcription attempts failed, returning fallback message");
          return { text: "[Transcription unavailable. Please check your network connection.]" };
        }
        return null;
      }
    } catch (error) {
      console.error("Transcription processing error:", error);
      return null;
    }
  }
}

export default new SpeechToTextService(); 