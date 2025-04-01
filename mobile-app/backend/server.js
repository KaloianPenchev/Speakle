const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const audioRoutes = require('./routes/audioRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { initAudio } = require('./utils/audioUtils');


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Speakle API server is running');
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API server is running' });
});


app.use('/api/auth', authRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
const FLASK_SERVER_URL = process.env.FLASK_SERVER_URL || 'http://localhost:5001';

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  
  socket.on('startDetection', () => {
    console.log('Received start detection request from client');
    io.emit('startDetection');
  });
  
  socket.on('stopDetection', () => {
    console.log('Received stop detection request from client');
    io.emit('stopDetection');
  });
  
  socket.on('gestureDetected', (data) => {
    console.log('Gesture detected:', data);
    io.emit('gestureDetected', data);
  });
});


app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});


server.listen(PORT, async () => {
  console.log(`Speakle API server running on port ${PORT}`);
  await initAudio();
}); 