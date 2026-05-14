const mongoose = require('mongoose');
const Counter = require('./Counter'); // Import your existing Counter model

const BookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true }, 
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    tickets: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    convenienceFee: { type: Number, required: true }, 
    totalAmount: { type: Number, required: true },
    paymentMode: { 
        type: String, 
        enum: ['Online / UPI', 'Debit / Credit', 'Cash', 'Wallet'], // Matched to image_bccff7.png
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Confirmed', 'Pending', 'Cancelled'], 
        default: 'Confirmed' 
    }
}, { timestamps: true });

BookingSchema.pre('save', async function () {
    if (this.isNew) {
        // Use your existing Counter logic
        const counter = await Counter.findOneAndUpdate(
            { id: 'booking_seq' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        // Formats ID as BK-10001, BK-10002, etc.
        this.bookingId = `BK-${10000 + counter.seq}`;
    }
});

module.exports = mongoose.model('Booking', BookingSchema);