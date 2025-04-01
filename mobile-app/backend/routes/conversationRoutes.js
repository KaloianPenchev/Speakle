const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');


router.post('/start', conversationController.startConversation);


router.post('/end', conversationController.endConversation);

module.exports = router; 