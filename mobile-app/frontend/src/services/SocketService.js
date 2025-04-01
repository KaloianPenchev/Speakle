import io from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.error('EXPO_PUBLIC_API_URL is not defined in environment');
}

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }
  
  connect() {
    if (this.socket) return;
    
    this.socket = io(API_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket']
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error');
    });
    
    this.socket.on('error', (error) => {
      console.error('Socket error');
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  on(event, callback) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.on(event, callback);
    
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      }
    }
  }
  
  emit(event, data) {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket.emit(event, data);
  }
  
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService(); 