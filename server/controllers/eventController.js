const Event = require('../models/Event');

// READ: GET /api/events
exports.getAllEvents = async (req, res) => {
    try {
        // Fetching events for the logged-in admin
        const events = await Event.find({ adminId: req.user.id });
        
        // This will now include 'bookedCount', 'capacity', and the virtual 'progress'
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE: POST /api/events
exports.createEvent = async (req, res) => {
    try {
        const newEvent = new Event({
            ...req.body,
            adminId: req.user.id 
        });
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// UPDATE: PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findOneAndUpdate(
            // Change eventId to _id to match the hex string from the URL
            { _id: req.params.id, adminId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found or unauthorized" });
        }
        
        res.status(200).json(updatedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE: DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const deleted = await Event.findOneAndDelete({ 
            // Change eventId to _id to match the hex string from the URL
            _id: req.params.id, 
            adminId: req.user.id 
        });
        
        if (!deleted) {
            return res.status(404).json({ message: "Event not found or unauthorized" });
        }
        
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};