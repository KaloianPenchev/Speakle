const express = require('express');
const router = express.Router();
const gestureController = require('../controllers/gestureController');


router.post('/predict', gestureController.predictGesture);

router.get('/data', gestureController.getLatestData);

router.get('/speak', gestureController.speakCurrentGesture);

module.exports = router; 