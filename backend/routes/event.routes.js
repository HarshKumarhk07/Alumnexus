const express = require('express');
const router = express.Router();
const { getEvents, createEvent, registerForEvent, deleteEvent, updateEvent } = require('../controllers/event.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');

router.get('/', getEvents);
router.post('/', protect, authorize('admin', 'alumni'), requireVerified, createEvent);
router.put('/:id', protect, authorize('admin', 'alumni'), requireVerified, updateEvent);
router.put('/register/:id', protect, registerForEvent);
router.delete('/:id', protect, authorize('admin', 'alumni'), requireVerified, deleteEvent);

module.exports = router;
