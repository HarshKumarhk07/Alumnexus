const Notification = require('../models/notification.model');

// @desc    Get All Notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
