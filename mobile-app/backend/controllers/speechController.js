const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.transcribeAudio = async (req, res) => {
  try {
    console.log('Transcription request received');
    
    if (!req.file) {
      console.error('No audio file provided in request');
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    console.log(`Processing audio file: ${filePath}`);

    try {
      
      const stats = fs.statSync(filePath);
      if (stats.size < 1000) { 
        console.log(`Audio file too small (${stats.size} bytes), may not contain speech`);
      }
      
      console.log('Calling OpenAI Whisper API...');
      
      if (!fs.existsSync(filePath)) {
        console.error(`File does not exist at path: ${filePath}`);
        return res.status(400).json({ error: 'Audio file not found on server' });
      }
      
      console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Configured' : 'Missing');
      
      const transcript = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
        language: req.body.language || 'en',
        response_format: 'json',
      });

      if (!transcript || !transcript.text) {
        console.log('Transcription returned no text');
        transcript.text = '';
      } else {
        console.log('Transcription successful:', transcript.text);
      }
      
      try {
        fs.unlinkSync(filePath);
        console.log('Temporary audio file deleted');
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }

      res.json({ text: transcript.text });
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('Temporary audio file deleted after error');
        } catch (cleanupError) {
          console.error('Error cleaning up file after API error:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: 'Failed to transcribe audio',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Server error processing audio:', error);
    res.status(500).json({ 
      error: 'Server error processing audio',
      details: error.message
    });
  }
}; 