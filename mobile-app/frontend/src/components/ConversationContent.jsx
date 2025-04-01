import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';

const ConversationContent = ({ recognizedText }) => {
  return (
    <ScrollView 
      style={styles.scrollableMiddle}
      contentContainerStyle={styles.middleContentContainer}
    >
      {recognizedText ? (
        <View style={styles.textContainer}>
          <Text style={styles.recognizedText}>{recognizedText}</Text>
        </View>
      ) : (
        <Text style={styles.waitingText}>
          Waiting for gesture...
        </Text>
      )}
      
      {/* Example previous conversations */}
      {Array(5).fill().map((_, i) => (
        <View key={i} style={[styles.textContainer, { marginTop: 10 }]}>
          <Text style={styles.recognizedText}>Previous conversation {i + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollableMiddle: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  middleContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  textContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recognizedText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  waitingText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 30,
  },
});

export default ConversationContent; 