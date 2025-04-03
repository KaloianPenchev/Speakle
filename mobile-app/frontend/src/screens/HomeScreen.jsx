import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import TextInputSection from '../components/TextInputSection';
import { SpeechToTextService } from '../services';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [hasAskedPermission, setHasAskedPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    SpeechToTextService.setTranscriptionCallback((text) => {
      if (text) {
        setRecognizedText(prevText => {
          if (!prevText) return text;
          return `${prevText} ${text}`;
        });
      }
    });

    return () => {
      if (isListening) {
        SpeechToTextService.stopRecording();
      }
    };
  }, []);

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };
  
  // Handler for the blue circle button (does nothing for now)
  const handleCircleButtonPress = () => {
    // This button has no functionality for now
    console.log("Circle button pressed - no action assigned");
  };

  const handleMicPress = async () => {
    try {
      if (isListening) {
        setIsProcessing(true);
        await SpeechToTextService.stopRecording();
        setIsListening(false);
        setIsProcessing(false);
      } else {
        setIsProcessing(true);
        
        let hasPermission = false;
        
        if (!hasAskedPermission) {
          hasPermission = await SpeechToTextService.requestPermissions();
          setHasAskedPermission(true);
        } else {
          hasPermission = await SpeechToTextService.checkPermissions();
        }
        
        if (!hasPermission) {
          setIsProcessing(false);
          Alert.alert(
            "Microphone Permission",
            "Speakle needs microphone access to recognize your speech. Please grant permission in your device settings.",
            [{ text: "OK" }]
          );
          return;
        }

        const success = await SpeechToTextService.startRecording();
        if (success) {
          setIsListening(true);
        } else {
          Alert.alert("Error", "Failed to start speech recognition");
        }
        
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Error", error.message || "Failed to toggle microphone");
    }
  };

  const handleClearText = () => {
    setRecognizedText('');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="book-outline" size={24} color="#555" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Speakle</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSettingsPress}>
          <Ionicons name="settings-outline" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#4285F4', '#34A5FF', '#5CBBFF']}
            locations={[0, 0.6, 1]}
            style={styles.circleButtonContainer}
          >
            <TouchableOpacity 
              style={styles.circleButton}
              onPress={handleCircleButtonPress}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <Ionicons name="hand-left" size={110} color="white" />
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSection}>
          <TextInputSection
            recognizedText={recognizedText}
            isListening={isListening}
            onClearText={handleClearText}
            onMicPress={handleMicPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  circleButtonContainer: {
    width: 320,
    height: 320,
    borderRadius: 160,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  circleButton: {
    width: '100%',
    height: '100%',
    borderRadius: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    width: '100%',
    flex: 1,
  },
});

export default HomeScreen; 

