const mongoose = require('mongoose');
const Counter = require('./Counter'); // Import the counter model

const UserSchema = new mongoose.Schema({
  userId: { type: Number },
  fullName: { type: String, required: true,trim: true },
  email: { type: String, required: true, unique: true,lowercase: true,trim: true },
  password: { type: String, required: true },
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'user_seq' }, 
        { $inc: { seq: 1 } }, 
        { new: true, upsert: true }
      );

      this.userId = counter.seq;
      // No next() needed here for async functions
    } catch (error) {
      console.error("Counter Error:", error);
      throw error; // Throwing error stops the save process correctly
    }
  }
});

module.exports = mongoose.model('User', UserSchema);