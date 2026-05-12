const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, staffController.getStaff);
router.post('/', protect, staffController.createStaff);
router.put('/:id', protect, staffController.updateStaff);
router.delete('/:id', protect, staffController.deleteStaff);

module.exports = router;