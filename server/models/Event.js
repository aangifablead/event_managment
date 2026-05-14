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
    date: { type: String, required: true }, 
    time: { type: String, required: true }, 
    
    // --- UPDATED FIELDS FOR BOOKING ---
    capacity: { type: Number, default: 100 }, // Total tickets available
    bookedCount: { type: Number, default: 0 }, // Total tickets already sold
    // ----------------------------------

    description: { type: String, default: "" }, 
    about: { type: String, default: "" }, 
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals show up in API response
    toObject: { virtuals: true }
});

// Virtual field for progress percentage
EventSchema.virtual('progress').get(function() {
    if (this.capacity === 0) return 0;
    const percent = (this.bookedCount / this.capacity) * 100;
    return Math.round(percent);
});

EventSchema.pre('save', async function () {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { id: 'event_seq' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.eventId = counter.seq;
    }

    if (this.isModified('venue') || this.isModified('city')) {
        this.location = `${this.venue}, ${this.city}`;
    }

    if (this.description && !this.about) {
        this.about = this.description;
    } else if (this.about && !this.description) {
        this.description = this.about;
    }
});

module.exports = mongoose.model('Event', EventSchema);