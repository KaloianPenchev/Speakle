const axios = require('axios');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const axiosInstance = axios.create({
  baseURL: OPENAI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const checkOpenAIConnectivity = async () => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    const response = await axiosInstance.get('/models');
    
    if (response.status === 200) {
      const models = response.data.data;
      const hasTTSModel = models.some(model => model.id.includes('tts-1'));
      
      return {
        success: true,
        modelCount: models.length,
        hasRequiredModels: hasTTSModel,
        models: models.map(m => m.id)
      };
    }
    
    return { success: false, reason: `Unexpected status: ${response.status}` };
  } catch (error) {
    console.error('OpenAI connectivity check failed:', error.message);
    return { 
      success: false, 
      reason: error.response?.data?.error?.message || error.message
    };
  }
};

const initAudio = async () => {
  try {
    await checkOpenAIConnectivity();
  } catch (error) {
    console.warn('Audio initialization failed:', error.message);
  }
};

const textToSpeech = async (text, voice = 'alloy') => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    if (!text) {
      throw new Error('Text is required for text-to-speech conversion');
    }
    
    const response = await axiosInstance.post('/audio/speech', {
      model: 'tts-1',
      input: text,
      voice: voice
    }, {
      responseType: 'arraybuffer'
    });
    
    const outputDir = path.join(__dirname, '../public/audio');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `speech-${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, filename);
    
    fs.writeFileSync(outputPath, response.data);
    
    return {
      success: true,
      filename: filename,
      path: `/audio/${filename}`
    };
  } catch (error) {
    console.error('TTS error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

module.exports = {
  textToSpeech,
  checkOpenAIConnectivity,
  initAudio
}; 