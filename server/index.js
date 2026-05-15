require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http'); // Required for Socket.io
const { Server } = require('socket.io'); // Required for Socket.io

const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoute');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoute = require('./routes/bookingRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server from express app

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL for better security
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

// Middleware to pass 'io' to every route/controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        if (data.userId) {
            socket.join(data.userId.toString());
            console.log(`User joined personal room: ${data.userId}`);
        }

        if (data.role === 'Administrator' || data.role === 'Admin') {
            socket.join('admin-room');
            console.log(`User joined admin-room for events`);
        }
    });
});


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ventixe')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoute);

// CRITICAL: Use server.listen instead of app.listen
server.listen(5000, () => console.log("Server running on port 5000 with WebSockets"));