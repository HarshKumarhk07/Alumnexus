const express = require('express');
const router = express.Router();
const { getEvents, createEvent, registerForEvent, deleteEvent, updateEvent } = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.put('/register/:id', protect, registerForEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

module.exports = router;
