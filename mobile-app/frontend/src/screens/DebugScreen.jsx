import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Button, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';

const DebugScreen = () => {
  const [logs, setLogs] = useState([]);
  const [serverIp, setServerIp] = useState('');
  const [serverPort, setServerPort] = useState('5000');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    addLog(`API URL: ${process.env.EXPO_PUBLIC_API_URL}`);
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleStartPolling = () => {
    addLog('Starting gesture polling...');
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/gesture/latest`);
        if (response.data && response.data.gesture_name) {
          addLog(`Current gesture: ${response.data.gesture_name}`);
        }
      } catch (error) {
        addLog(`Polling error: ${error.message}`);
      }
    }, 1000); 
    
    setPollingInterval(interval);
    setIsPolling(true);
    addLog('Gesture polling started');
  };

  const handleStopPolling = () => {
    addLog('Stopping gesture polling...');
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsPolling(false);
      addLog('Gesture polling stopped');
    }
  };

  const handleTestConnection = async () => {
    const testUrl = `http://${serverIp}:${serverPort}/api`;
    addLog(`Testing connection to: ${testUrl}`);
    
    try {
      const response = await axios.get(testUrl, { timeout: 5000 });
      addLog(`Connection successful! Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      addLog(`Connection failed: ${error.message}`);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Debug</Text>
      <Text style={styles.status}>
        Status: <Text style={isPolling ? styles.connected : styles.disconnected}>
          {isPolling ? 'Polling Active' : 'Polling Inactive'}
        </Text>
      </Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.startButton]} 
          onPress={handleStartPolling}
        >
          <Text style={styles.buttonText}>Start Polling</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.stopButton]} 
          onPress={handleStopPolling}
        >
          <Text style={styles.buttonText}>Stop Polling</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.customConnectContainer}>
        <Text style={styles.sectionTitle}>Test API Connection</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.ipInput}
            placeholder="Server IP"
            value={serverIp}
            onChangeText={setServerIp}
          />
          <Text style={styles.separator}>:</Text>
          <TextInput
            style={styles.portInput}
            placeholder="Port"
            value={serverPort}
            onChangeText={setServerPort}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, styles.customButton]}
          onPress={handleTestConnection}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Logs</Text>
          <TouchableOpacity onPress={handleClearLogs}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.logs}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logEntry}>{log}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  connected: {
    color: 'green',
    fontWeight: 'bold',
  },
  disconnected: {
    color: 'red',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#FF9800',
  },
  customButton: {
    backgroundColor: '#9C27B0',
  },
  customConnectContainer: {
    marginVertical: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ipInput: {
    flex: 3,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  separator: {
    paddingHorizontal: 8,
  },
  portInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButton: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  logs: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
});

export default DebugScreen; 