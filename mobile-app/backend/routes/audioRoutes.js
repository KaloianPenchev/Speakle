const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

router.get('/tts', audioController.createTTS);
router.post('/tts', audioController.createTTS);
router.get('/check-openai', audioController.checkOpenAI);

router.get('/test-tts', async (req, res) => {
  try {
    return audioController.createTTS({
      method: 'GET',
      query: {
        text: 'This is a test of the text to speech API.',
        voice: 'alloy'
      }
    }, res);
  } catch (error) {
    console.error('Test TTS error:', error);
    return res.status(500).json({ error: 'Test TTS failed' });
  }
});

module.exports = router;