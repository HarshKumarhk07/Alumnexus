const Event = require('../models/event.model');

// @desc    Get All Events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('speaker', 'name').sort({ dateTime: 1 });
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        console.error('Error in getEvents:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create Event
// @route   POST /api/events
// @access  Private (Admin)
exports.createEvent = async (req, res) => {
    try {
        const Notification = require('../models/notification.model');
        const User = require('../models/user.model');
        const { title, dateTime, endTime, description, meetingType, meetingLink, location, speakerName, speaker } = req.body;

        const event = await Event.create({
            title,
            dateTime,
            endTime,
            description,
            meetingType,
            meetingLink,
            location,
            speakerName: speakerName || speaker, // Fallback to speaker if frontend sends it as 'speaker'
            speaker: req.user.id
        });

        // Notify all Students and Alumni about the new event
        const users = await User.find({ role: { $in: ['student', 'alumni'] } });

        if (users.length > 0) {
            const notifications = users.map(user => ({
                user: user._id,
                message: `New Event: ${event.title} (${meetingType}) is scheduled for ${new Date(event.dateTime).toLocaleString()}`,
                type: 'info'
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, data: event });
    } catch (err) {
        console.error('Error in createEvent:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Register for Event
// @route   PUT /api/events/register/:id
// @access  Private
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const userId = req.user._id || req.user.id;
        if (event.registeredStudents.includes(userId)) {
            return res.status(400).json({ success: false, message: 'Already registered' });
        }

        event.registeredStudents.push(userId);
        await event.save();

        res.status(200).json({ success: true, message: 'Registered successfully' });
    } catch (err) {
        console.error('Error in registerForEvent:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete Event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check for ownership/authorization
        if (event.speaker && event.speaker.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error in deleteEvent:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update Event
// @route   PUT /api/events/:id
// @access  Private (Admin)
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check for ownership/authorization
        if (event.speaker && event.speaker.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this event' });
        }

        const { title, dateTime, endTime, description, meetingType, meetingLink, location, speakerName } = req.body;

        event = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title,
                dateTime,
                endTime,
                description,
                meetingType,
                meetingLink,
                location,
                speakerName
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: event });
    } catch (err) {
        console.error('Error in updateEvent:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
