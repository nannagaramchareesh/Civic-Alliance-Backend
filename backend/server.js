// import express from 'express';
// import cors from 'cors';
// import connectDB from './config/mongodb.js';
// import departmentHeadRouter from './routes/departmentHead.js';
// import adminRouter from './routes/admin.js';
// import 'dotenv/config';

// // App Configuration
// const app = express();
// const port = process.env.PORT || 5000;

// // Connect to MongoDB
// connectDB();

// // Middlewares
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/admin', adminRouter);
// app.use('/api/departmentHead', departmentHeadRouter);

// app.listen(port, () => {
//     console.log("Listening on port", port);
// });
// server.js
import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import { Server as SocketIO } from 'socket.io';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import departmentHeadRouter from './routes/departmentHead.js';
import adminRouter from './routes/admin.js';

// Express App & HTTP Server
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
connectDB();

// Routes
app.use('/api/admin', adminRouter);
app.use('/api/departmentHead', departmentHeadRouter);

// Chat Message Schema
const messageSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// Get Messages REST Endpoint
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Socket.IO Chat Events
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send chat history
  Message.find().sort({ timestamp: 1 }).then((messages) => {
    socket.emit('previousMessages', messages);
  });

  socket.on('newMessage', async (data) => {
    const message = new Message(data);
    await message.save();
    io.emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
