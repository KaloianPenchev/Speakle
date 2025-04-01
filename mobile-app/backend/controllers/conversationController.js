const axios = require('axios');
const crypto = require('crypto');
const { activeConversations, generateConversationId, notifyFlaskServer } = require('../utils/conversationUtils');
require('dotenv').config();

const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || 'http://localhost:5001';

const startConversation = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required to start a conversation'
            });
        }
        
        const conversationId = generateConversationId();
        const startedAt = new Date().toISOString();
        
        activeConversations.set(conversationId, {
            id: conversationId,
            user_id: userId,
            status: 'active',
            started_at: startedAt,
            ended_at: null
        });
        
        await notifyFlaskServer('start_detection');
        
        res.json({
            success: true,
            conversation: {
                id: conversationId,
                user_id: userId,
                status: 'active',
                started_at: startedAt
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting conversation',
            error: error.message
        });
    }
};

const endConversation = async (req, res) => {
    try {
        const { conversationId } = req.body;
        
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID is required to end a conversation'
            });
        }
        
        const conversation = activeConversations.get(conversationId);
        
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
        
        const endedAt = new Date().toISOString();
        conversation.status = 'completed';
        conversation.ended_at = endedAt;
        
        await notifyFlaskServer('stop_detection');
        
        res.json({
            success: true,
            conversation: {
                id: conversationId,
                status: 'completed',
                ended_at: endedAt
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error ending conversation',
            error: error.message
        });
    }
};

module.exports = {
    startConversation,
    endConversation
};