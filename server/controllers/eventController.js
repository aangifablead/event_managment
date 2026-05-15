const Event = require('../models/Event');

// READ: GET /api/events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({ adminId: req.user.id });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE: POST /api/events (Fixing the name here)
exports.createEvent = async (req, res) => {
    try {
        const newEvent = new Event({
            ...req.body,
            adminId: req.user.id,
            bookedCount: 0 
        });
        
        await newEvent.save();

        if (req.io) {
            // We send to 'admin-room' so the dashboard updates for everyone logged in
            req.io.to('admin-room').emit('new-notification', {
                message: `New Event Created: ${newEvent.name}`,
                type: 'INFO'
            });
        }

        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// UPDATE: PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findOneAndUpdate(
            { _id: req.params.id, adminId: req.user.id },
            req.body,
            { new: true }
        );

        // Notify if capacity update results in a Sold Out state
        if (req.io && updatedEvent.bookedCount >= updatedEvent.capacity) {
            req.io.to(req.user.id).emit('new-notification', {
                message: `Notice: "${updatedEvent.name}" is now marked as Sold Out.`,
                type: 'DANGER'
            });
        }

        res.json(updatedEvent);
    } catch (e) {
        res.status(400).json({ message: "Update failed" });
    }
};

// DELETE: DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const deleted = await Event.findOneAndDelete({ 
            _id: req.params.id, 
            adminId: req.user.id 
        });
        if (!deleted) return res.status(404).json({ message: "Event not found" });
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};