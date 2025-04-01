import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Ionicons } from '@expo/vector-icons';
import ConversationItem from '../components/ConversationItem';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const displayName = user?.user_metadata?.username || 
                      (user?.email ? user.email.split('@')[0] : 'Anonymous');
  
  const conversations = [
    {
      id: '1',
      title: 'Meeting with John',
      description: 'Hello, how are you doing today? I wanted to discuss...',
      started_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      messages: [],
      is_favorite: false
    },
    {
      id: '2',
      title: 'Coffee Chat',
      description: 'Thanks for meeting me at the café. The discussion was...',
      started_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      messages: [],
      is_favorite: true
    },
    {
      id: '3',
      title: 'Team Update',
      description: 'The project timeline has been updated. We need to...',
      started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      messages: [],
      is_favorite: false
    },
    {
      id: '4',
      title: 'Product Review',
      description: 'I have looked at the latest version and I think the UI improvements are...',
      started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      messages: [],
      is_favorite: false
    }
  ];

  const handleConversationPress = (conversation) => {
    console.log('Conversation pressed:', conversation.id);
  };

  const handleDeleteConversation = (conversationId) => {
    console.log('Delete conversation:', conversationId);
  };

  const handleStartConversation = () => {
    navigation.navigate('LiveConversation');
  };
  
  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>247</Text>
            <Text style={styles.statLabel}>Words Today</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartConversation}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>Start Conversation</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search conversations"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.conversationsContainer}>
          {conversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onPress={handleConversationPress}
              onDelete={handleDeleteConversation}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#b5b3b3',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4285F4',
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  conversationsContainer: {
    marginTop: 10,
  },
});

export default HomeScreen; 

