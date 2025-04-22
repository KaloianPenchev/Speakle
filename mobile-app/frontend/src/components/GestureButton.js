import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const GestureButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const speakCurrentGesture = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    startPulseAnimation();
    
    try {
      // Call the backend API to get the current gesture and its speech
      const response = await axios.get(`${API_URL}/api/gesture/speak`);
      
      if (response.data && response.data.audioBase64) {
        // Save the base64 audio to a temporary file
        const fileUri = FileSystem.documentDirectory + 'temp_audio.mp3';
        await FileSystem.writeAsStringAsync(
          fileUri,
          response.data.audioBase64,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        // Create and play the sound
        const soundObject = new Audio.Sound();
        await soundObject.loadAsync({ uri: fileUri });
        
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            stopPulseAnimation();
          }
        });
        
        await soundObject.playAsync();
        
        // Update current gesture
        if (response.data.gesture) {
          setCurrentGesture(response.data.gesture);
        }
      } else {
        // No audio data or no valid gesture
        setIsPlaying(false);
        stopPulseAnimation();
      }
    } catch (error) {
      console.error('Error speaking current gesture:', error);
      setIsPlaying(false);
      stopPulseAnimation();
    }
  };

  const handlePress = () => {
    speakCurrentGesture();
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.animatedContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isPlaying ? styles.buttonActive : null
          ]}
          onPress={handlePress}
          disabled={isPlaying}
        >
          <Text style={styles.buttonText}>
            {isPlaying ? "Speaking..." : "Speak Gesture"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonActive: {
    backgroundColor: '#3367D6',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GestureButton; 