require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const staffRoutes=require('./routes/staffRoute')
const eventRoutes = require('./routes/eventRoutes')

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ventixe')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/staff',staffRoutes)
app.use('/api/events', eventRoutes);
app.listen(5000, () => console.log("Server running on port 5000"));