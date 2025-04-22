const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const tempDir = path.join(__dirname, '..', 'temp_audio');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

exports.textToSpeech = async (req, res) => {
  const { text, voice = 'alloy' } = req.body; 

  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is missing');
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

  try {
    console.log(`Requesting TTS for text: "${text}" with voice: ${selectedVoice}`);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1", // or "tts-1-hd"
      voice: selectedVoice,
      input: text,
      response_format: "mp3", // Specify format
    });

    
    const speechFile = path.join(tempDir, `speech_${Date.now()}.mp3`);
    
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);

    console.log(`Audio file saved successfully: ${speechFile}`);


    const audioBase64 = buffer.toString('base64');

    
    try {
      await fs.promises.unlink(speechFile);
    } catch (cleanupError) {
      console.error(`Error deleting temporary file ${speechFile}:`, cleanupError);
    }

    res.status(200).json({ audioBase64: audioBase64, format: 'mp3' });

  } catch (error) {
    console.error('Error calling OpenAI TTS API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to generate speech', details: error.message });
  }
}; 