const Booking = require('../models/Booking');
const Event = require('../models/Event');

exports.createBooking = async (req, res) => {
    try {
        const { eventId, customerName, email, tickets, paymentMode } = req.body;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        // 1. Capacity Check
        if (event.bookedCount + tickets > event.capacity) {
            return res.status(400).json({ message: "Not enough tickets available" });
        }

        // 2. Calculations (Matching image_bccffc.png)
        const subtotal = event.price * tickets;
        const convenienceFee = Math.round(subtotal * 0.03); // 3% fee
        const totalAmount = subtotal + convenienceFee;

        // 3. Create Booking
        const newBooking = new Booking({
            event: eventId,
            customerName,
            email,
            tickets: Number(tickets),
            subtotal,
            convenienceFee,
            totalAmount,
            paymentMode
        });

        await newBooking.save();

        // 4. Update Event bookedCount
        event.bookedCount += Number(tickets);
        await event.save();

        res.status(201).json({ message: "Booking confirmed!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Fetches all bookings for the table in image_bccfda.png
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('event', 'name capacity bookedCount progress') // Populate event details for status badges
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};