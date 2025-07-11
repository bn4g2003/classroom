const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./config/firebase');

const authRoutes = require('./routes/auth.routes');
const instructorRoutes = require('./routes/instructor.routes');
const studentRoutes = require('./routes/student.routes');

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"]
};
app.use(cors(corsOptions));
const io = new Server(server, {
  cors: corsOptions
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);

const userSockets = {};

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  socket.on('join', (phoneNumber) => {
    console.log(`User ${phoneNumber} joined with socket ${socket.id}`);
    socket.join(phoneNumber);
    userSockets[phoneNumber] = socket.id;
    
    socket.broadcast.emit('userOnline', phoneNumber);
  });
  
  socket.on('sendMessage', async ({ from, to, message, timestamp }) => {
    console.log(`Message from ${from} to ${to}: ${message}`);
    
    try {
      const messageData = {
        from,
        to,
        message,
        timestamp: timestamp || new Date(),
        read: false
      };
      
      await db.collection('messages').add(messageData);
      
      const payload = { 
        from, 
        to,
        message, 
        timestamp: messageData.timestamp
      };
      
      socket.to(to).emit('receiveMessage', payload);
      
      console.log(`Message delivered and saved from ${from} to ${to}`);
    } catch (error) {
      console.log('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    let disconnectedUser = null;
    for (const phone in userSockets) {
      if (userSockets[phone] === socket.id) {
        disconnectedUser = phone;
        delete userSockets[phone];
        break;
      }
    }
    
    if (disconnectedUser) {
      console.log(`User ${disconnectedUser} disconnected`);
      socket.broadcast.emit('userOffline', disconnectedUser);
    }
    
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});