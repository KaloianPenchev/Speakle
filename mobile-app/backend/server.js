require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { initialize_detector } = require('./utils/predict_module/simple_predictor');

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.options('*', cors());

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

try {
  // Setup needed directories
  const templatesDir = path.join(__dirname, 'templates');
  require('fs').mkdirSync(templatesDir, { recursive: true });
  
  // Initialize gesture detector
  console.log("Initializing gesture detector...");
  try {
    initialize_detector();
    console.log("Gesture detector initialized successfully");
  } catch (e) {
    console.warn(`WARNING: Error initializing detector: ${e.message}`);
    console.warn("Server will start anyway, but gesture recognition may not work");
  }
  
  const speechRoutes = require('./routes/speechRoutes');
  const authRoutes = require('./routes/authRoutes');
  const profileRoutes = require('./routes/profileRoutes');
  const gestureRoutes = require('./routes/gestureRoutes');
  
  app.use('/api', speechRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/gesture', gestureRoutes);
  
  const PORT = process.env.PORT || 5000;
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started! Access the interface at http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Server startup error:', error.message);
  process.exit(1);
}

module.exports = { app, server }; 