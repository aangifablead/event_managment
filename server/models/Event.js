const mongoose = require('mongoose');
const Counter = require('./Counter');

const EventSchema = new mongoose.Schema({
    eventId: { type: Number },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    image: { type: String, default: '/api/placeholder/400/320' },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    location: { type: String }, 
    progress: { type: Number, default: 0 },
    date: { type: String, required: true }, 
    time: { type: String, required: true }, 
    capacity: { type: Number, default: 0 },
    // Added description field for detailed event info
    description: { type: String, default: "" }, 
    // Kept 'about' in case your UI components reference this specific key
    about: { type: String, default: "" }, 
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, { timestamps: true });

// Middleware for ID generation and string formatting
// Middleware for ID generation and string formatting
EventSchema.pre('save', async function () { // Removed 'next' here
    // Auto-increment EventId
    if (this.isNew) {
        // No change to logic inside, just ensure we don't call next()
        const counter = await Counter.findOneAndUpdate(
            { id: 'event_seq' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.eventId = counter.seq;
    }

    // Sync location string
    if (this.isModified('venue') || this.isModified('city')) {
        this.location = `${this.venue}, ${this.city}`;
    }

    // Optional: Keep description and about in sync
    if (this.description && !this.about) {
        this.about = this.description;
    } else if (this.about && !this.description) {
        this.description = this.about;
    }
    
    // No next() call needed for async hooks
});

module.exports = mongoose.model('Event', EventSchema);