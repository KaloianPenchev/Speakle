import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';

const UserAccountScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        
        if (user) {
          setProfileData({
            username: user.username || user.email,
            email: user.email,
            created_at: user.created_at || new Date().toISOString()
          });
        }
        
        
        const profile = await profileService.getProfile();
        
        if (profile) {
          setProfileData(profile);
        }
      } catch (err) {
        console.error('Profile fetch error:', err.message || 'Unknown error');
        setError('Unable to fetch latest profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRetry = () => {
    fetchProfile();
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await profileService.getProfile();
      if (profile) {
        setProfileData(profile);
      }
    } catch (err) {
      console.error('Retry error:', err);
      setError('Failed to load profile data.');
      
      
      if (!profileData && user) {
        setProfileData({
          username: user.username || user.email,
          email: user.email,
          created_at: user.created_at || new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
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
        <Text style={styles.headerTitle}>Account Information</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Loading account information...</Text>
          </View>
        ) : (
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#4285F4" />
            </View>
            
            {error && (
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle-outline" size={20} color="#F57C00" />
                <Text style={styles.warningText}>{error}</Text>
                <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{profileData?.username || 'Not available'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profileData?.email || 'Not available'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Account Created</Text>
                <Text style={styles.infoValue}>
                  {formatDate(profileData?.created_at)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  warningText: {
    color: '#F57C00',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#F57C00',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  }
});

export default UserAccountScreen; 