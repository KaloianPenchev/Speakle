import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiClient, profileService } from '../services';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [loading, setLoading] = useState(false);

  const voices = [
    { id: 0, name: 'Alloy', description: 'Neutral male voice', gender: 'Male' },
    { id: 1, name: 'Echo', description: 'Neutral voice', gender: 'Neutral' },
    { id: 2, name: 'Fable', description: 'Female voice', gender: 'Female' },
    { id: 3, name: 'Onyx', description: 'Deep male voice', gender: 'Male' },
    { id: 4, name: 'Nova', description: 'Bright female voice', gender: 'Female' },
    { id: 5, name: 'Shimmer', description: 'Soft female voice', gender: 'Female' }
  ];

  const voiceIdToName = {
    0: 'alloy',
    1: 'echo',
    2: 'fable',
    3: 'onyx',
    4: 'nova',
    5: 'shimmer'
  };

  useEffect(() => {
    loadUserVoicePreference();
  }, []);

  const loadUserVoicePreference = async () => {
    try {
      const savedVoice = await AsyncStorage.getItem('selectedVoice');
      
      if (savedVoice) {
        if (isNaN(savedVoice)) {
          const voiceId = Object.keys(voiceIdToName).find(
            key => voiceIdToName[key] === savedVoice
          );
          setSelectedVoice(voiceId ? parseInt(voiceId, 10) : 0);
        } else {
          setSelectedVoice(parseInt(savedVoice, 10));
        }
      }
      
      if (user) {
        setLoading(true);
        try {
          const profileData = await profileService.getProfile();
          
          if (profileData && profileData.voice !== undefined) {
            setSelectedVoice(profileData.voice);
            await AsyncStorage.setItem('selectedVoice', profileData.voice.toString());
          }
        } catch (apiError) {
          console.warn('Could not load profile from API, using local settings instead');
        }
      }
    } catch (error) {
      console.error('Error loading user voice preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveVoiceSelection = async (voiceId) => {
    try {
      setLoading(true);
      setSelectedVoice(voiceId);
      await AsyncStorage.setItem('selectedVoice', voiceId.toString());
      
      if (user) {
        try {
          await profileService.updateVoice(voiceId);
        } catch (apiError) {
          console.warn('Could not save profile to API, saved locally only');
        }
      }
      
      const voiceName = voiceIdToName[voiceId];
      if (voiceName) {
        await AsyncStorage.setItem('voiceName', voiceName);
      }
    } catch (error) {
      console.error('Error saving voice selection:', error);
      Alert.alert('Error', 'Failed to save voice preference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Log Out',
            onPress: async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Options</Text>
          <Text style={styles.sectionSubtitle}>Select a voice for text-to-speech output</Text>
          
          {voices.map((voice) => (
            <TouchableOpacity 
              key={voice.id}
              style={[
                styles.voiceOption,
                selectedVoice === voice.id && styles.selectedVoiceOption
              ]}
              onPress={() => saveVoiceSelection(voice.id)}
              disabled={loading}
            >
              <View style={styles.voiceDetails}>
                <Text style={styles.voiceName}>{voice.name}</Text>
                <Text style={styles.voiceDescription}>{voice.description}</Text>
              </View>
              
              {selectedVoice === voice.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4285F4" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity 
            style={styles.accountOption}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
            <Ionicons name="exit-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  voiceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedVoiceOption: {
    backgroundColor: '#F0F7FF',
  },
  voiceDetails: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  voiceDescription: {
    fontSize: 14,
    color: '#666',
  },
  accountOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  }
});

export default SettingsScreen; 