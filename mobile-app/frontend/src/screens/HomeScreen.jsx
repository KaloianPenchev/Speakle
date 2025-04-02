import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleMicPress = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setRecognizedText('Tap the hand to start recognizing speech.');
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
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              <Ionicons name="hand-left" size={110} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.textSectionWrapper}>
            <View style={styles.textSectionTopBorder} />
            <LinearGradient
              colors={['#f0f0f0', '#f5f5f5', '#f9f9f9']}
              locations={[0, 0.5, 1]}
              style={styles.textSection}
            >
              {recognizedText ? (
                <Text style={styles.recognizedText}>{recognizedText}</Text>
              ) : (
                <Text style={styles.placeholderText}>There is nothing in this text yet...</Text>
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
                onPress={handleClearText}
                android_ripple={{ color: 'rgba(0, 0, 0, 0.05)' }}
              >
                <Ionicons name="trash-outline" size={22} color="#4285F4" />
                <Text style={styles.clearButtonText}>Clear Text</Text>
              </Pressable>
            </LinearGradient>

            <View style={styles.micButtonContainer}>
              <Pressable
                style={({pressed}) => [
                  styles.micButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={handleMicPress}
              >
                <Ionicons name="mic" size={28} color={isListening ? "#4285F4" : "#777"} />
              </Pressable>
            </View>
          </View>
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
});

export default HomeScreen; 

