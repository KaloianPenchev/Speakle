import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import { useNavigation } from '@react-navigation/native';

const LiveConversationScreen = () => {
  const navigation = useNavigation();
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  const handleEndCall = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Top controls - Settings only */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="settings-sharp" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Central Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Avatar size={120} />
          <View style={styles.statusIndicator} />
        </View>
      </View>
      
      {/* Bottom Controls - Mute, Mic, End Call */}
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.bottomControlButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons 
            name={isMuted ? "volume-mute" : "volume-high"} 
            size={26} 
            color="#333"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomControlButton}
          onPress={() => setIsMicOn(!isMicOn)}
        >
          <Ionicons 
            name={isMicOn ? "mic" : "mic-off"} 
            size={26} 
            color="#333"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomControlButton, styles.endCallButton]}
          onPress={handleEndCall}
        >
          <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#F5F5F5',
    bottom: 5,
    right: 5,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  bottomControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
});

export default LiveConversationScreen; 