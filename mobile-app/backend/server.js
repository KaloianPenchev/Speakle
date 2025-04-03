require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add OPTIONS handling for preflight requests
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

// Health check route
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

try {
  // Import routes
  const speechRoutes = require('./routes/speechRoutes');
  const authRoutes = require('./routes/authRoutes');
  const profileRoutes = require('./routes/profileRoutes');
  
  // Routes with concise naming
  app.use('/api', speechRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/user', profileRoutes);
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Server startup error:', error.message);
  process.exit(1);
}

module.exports = { app, server }; 