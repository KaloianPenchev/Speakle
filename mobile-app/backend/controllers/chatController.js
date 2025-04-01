const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL
});

const processGPTMessage = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required for chat'
            });
        }
        
        const messages = [
            { role: 'system', content: 'You are a helpful assistant for Speakle Smart Glove users. Be concise and clear in your responses.' },
            ...history,
            { role: 'user', content: message }
        ];
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 150
        });
        
        const response = completion.choices[0].message.content;
        
        res.json({
            success: true,
            response: response
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing chat message',
            error: error.message
        });
    }
};

module.exports = {
    processGPTMessage
}; 