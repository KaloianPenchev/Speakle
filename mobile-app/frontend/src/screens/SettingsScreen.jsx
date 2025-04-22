import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

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
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const navigateToUserAccount = () => {
    navigation.navigate('UserAccount');
  };

  const navigateToMyVoice = () => {
    navigation.navigate('MyVoice');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={navigateToUserAccount}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={24} color="#4285F4" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>User Account</Text>
            <Text style={styles.settingDescription}>View your account information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C8C8C8" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={navigateToMyVoice}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E9F7E9' }]}>
            <Ionicons name="volume-medium-outline" size={24} color="#4285F4" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>My Voice</Text>
            <Text style={styles.settingDescription}>Change your text-to-speech voice</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C8C8C8" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, { marginTop: 32 }]} 
          onPress={handleLogout}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
          </View>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: '#F44336' }]}>Logout</Text>
            <Text style={styles.settingDescription}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>
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
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
});

export default SettingsScreen; 