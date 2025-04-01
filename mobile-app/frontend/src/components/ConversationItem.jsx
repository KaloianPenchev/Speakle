import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

const ConversationItem = ({ conversation, onPress, onDelete }) => {
  if (!conversation) {
    return null;
  }
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(conversation)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {conversation.started_at ? formatDate(conversation.started_at) : 'Unknown date'}
          </Text>
          {conversation.is_favorite && (
            <Ionicons name="star" size={16} color="#FFD700" />
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={1}>
          {conversation.title || 'Untitled Conversation'}
        </Text>
        
        <Text style={styles.subtitle} numberOfLines={2}>
          {conversation.description || `${conversation.messages?.length || 0} messages`}
        </Text>
      </View>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(conversation.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginRight: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
  },
  deleteButton: {
    padding: 5,
  },
});

export default ConversationItem; 