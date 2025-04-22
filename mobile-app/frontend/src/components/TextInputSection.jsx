import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const TextInputSection = ({ 
  recognizedText, 
  isListening, 
  onClearText, 
  onMicPress 
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [prevTextLength, setPrevTextLength] = useState(0);

  useEffect(() => {
    if (recognizedText && recognizedText.length > prevTextLength) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
      setPrevTextLength(recognizedText.length);
    }
  }, [recognizedText, fadeAnim, prevTextLength]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (prevTextLength > 0 && recognizedText) {
        setPrevTextLength(recognizedText.length);
      }
    }
  }, [isListening, pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.textSectionWrapper}>
        <View style={styles.textSectionTopBorder} />
        <LinearGradient
          colors={['#f0f0f0', '#f8f8f8', '#ffffff']}
          locations={[0, 0.3, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.textSection}
        >
          {recognizedText ? (
            <Animated.Text style={[styles.recognizedText, { opacity: fadeAnim }]}>
              {recognizedText}
            </Animated.Text>
          ) : (
            <Text style={styles.placeholderText}>
              {isListening 
                ? "Listening... speak now"
                : "There is nothing in this text yet..."}
            </Text>
          )}
        </LinearGradient>
        <View style={styles.textSectionBottomBorder} />
      </View>

      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['#f0f0f0', '#fafafa', '#ffffff']}
          locations={[0, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.clearButtonContainer}
        >
          <Pressable 
            style={({pressed}) => [
              styles.clearButton,
              pressed && styles.buttonPressed
            ]}
            onPress={onClearText}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
          >
            <Ionicons name="trash-outline" size={22} color="#4285F4" />
            <Text style={styles.clearButtonText}>Clear Text</Text>
          </Pressable>
        </LinearGradient>

        <Animated.View 
          style={[
            styles.micButtonContainer,
            isListening && styles.micButtonContainerActive,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Pressable
            style={({pressed}) => [
              styles.micButton,
              isListening && styles.micButtonActive,
              pressed && styles.buttonPressed
            ]}
            onPress={onMicPress}
          >
            <Ionicons 
              name={isListening ? "mic" : "mic-off"} 
              size={28} 
              color={isListening ? "#4285F4" : "#777"} 
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    position: 'relative',
  },
  textSectionWrapper: {
    width: '100%',
  },
  textSectionTopBorder: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  textSection: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: 120,
  },
  textSectionBottomBorder: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  recognizedText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#757575',
  },
  bottomContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    position: 'absolute',
    bottom: 0,
  },
  clearButtonContainer: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  clearButtonText: {
    color: '#4285F4',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  micButtonContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonContainerActive: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  micButtonActive: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderWidth: 2,
    borderColor: '#4285F4',
  }
});

export default TextInputSection; 