const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Start a conversation
router.post('/start', conversationController.startConversation);

// End a conversation
router.post('/end', conversationController.endConversation);

module.exports = router; 