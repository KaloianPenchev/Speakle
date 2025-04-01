const crypto = require('crypto');
const axios = require('axios');

const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || 'http://localhost:5001';

const activeConversations = new Map();

const generateConversationId = () => {
  return crypto.randomUUID();
};

const notifyFlaskServer = async (action) => {
  try {
    if (!FLASK_SERVER_URL) {
      return;
    }
    
    await axios.post(`${FLASK_SERVER_URL}/api/notify`, {
      action
    });
  } catch (error) {
    console.error('Failed to notify Flask server:', error.message);
  }
};

module.exports = {
  activeConversations,
  generateConversationId,
  notifyFlaskServer
}; 