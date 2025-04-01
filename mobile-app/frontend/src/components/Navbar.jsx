import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const displayName = user?.user_metadata?.username || 
                      (user?.email ? user.email.split('@')[0] : 'Anonymous');
  
  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <Avatar size={40} />
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {displayName}
            </Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusIndicator} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#4285F4" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    justifyContent: 'center',
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    padding: 8,
  },
});

export default Navbar; 