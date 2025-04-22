const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', profileController.getProfile);

router.put('/', profileController.updateProfile);

router.post('/voice', profileController.updateVoice);

router.post('/language', profileController.updateLanguage);

module.exports = router;