const fs = require('fs');
const path = require('path');
const { openai, initializeOpenAI, voiceMap, checkVoiceSupport } = require('../utils/audioUtils');
const dotenv = require('dotenv');

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const createTTS = async (req, res) => {
  const method = req.method;
  let text = '';
  let voice = 'alloy';
  
  if (method === 'GET') {
    text = req.query.text || '';
    voice = req.query.voice || 'alloy';
  } else if (method === 'POST') {
    text = req.body.text || '';
    voice = req.body.voice || 'alloy';
  }
  
  if (!isNaN(voice)) {
    voice = voiceMap[voice] || 'alloy';
  }
  
  const selectedVoice = checkVoiceSupport(voice);
  
  if (!text) {
    return res.status(400).json({ 
      success: false,
      message: 'Text parameter is required' 
    });
  }
  
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ 
      success: false,
      message: 'OpenAI API key is not configured' 
    });
  }
  
  try {
    if (!openai) {
      if (!initializeOpenAI()) {
        return res.status(500).json({ 
          success: false,
          message: 'Failed to initialize OpenAI client' 
        });
      }
    }
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice,
      input: text,
    });
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  } catch (error) {
    let errorMessage = 'Failed to generate TTS audio';
    
    if (error.response) {
      try {
        errorMessage = `OpenAI API error: ${error.response.status} - ${error.response.data.error.message}`;
      } catch (e) {
        errorMessage = `OpenAI API error: ${error.response.status}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      success: false,
      message: errorMessage 
    });
  }
};

const checkOpenAI = async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.json({
        success: false,
        message: 'OpenAI API key is not configured'
      });
    }
    
    if (!openai) {
      if (!initializeOpenAI()) {
        return res.json({
          success: false,
          message: 'Failed to initialize OpenAI client'
        });
      }
    }
    
    const models = await openai.models.list();
    
    const modelNames = models.data.map(model => model.id);
    const hasTTS = modelNames.includes('tts-1');
    
    return res.json({
      success: true,
      message: 'Successfully connected to OpenAI API',
      modelCount: modelNames.length,
      hasRequiredModels: hasTTS,
    });
  } catch (error) {
    let errorMessage = 'Failed to connect to OpenAI API';
    
    if (error.response) {
      try {
        errorMessage = `OpenAI API error: ${error.response.status} - ${error.response.data.error.message}`;
      } catch (e) {
        errorMessage = `OpenAI API error: ${error.response.status}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

module.exports = {
  createTTS,
  checkOpenAI
}; 