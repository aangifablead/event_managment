const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// All event routes are protected by JWT
router.use(protect);

router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;