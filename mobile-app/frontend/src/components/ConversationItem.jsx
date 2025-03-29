import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConversationItem = ({ title, preview, time, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {preview}
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={styles.time}>{time}</Text>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={16} color="#4285F4" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.expandButton}>
          <Ionicons name="expand" size={16} color="#4285F4" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  preview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  playButton: {
    marginBottom: 8,
  },
  expandButton: {
    // No margin needed for the last item
  },
});

export default ConversationItem; 