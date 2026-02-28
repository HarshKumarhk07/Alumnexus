const Query = require('../models/query.model');
const Notification = require('../models/notification.model');

// @desc    Get all queries
// @route   GET /api/queries
// @access  Private
exports.getQueries = async (req, res) => {
    try {
        let query;

        // If user is a student, only show their own queries
        if (req.user.role === 'student') {
            query = Query.find({ student: req.user.id });
        } else {
            // Alumni and Admins see all queries
            query = Query.find();
        }

        // Sort by newest first
        query = query.sort('-createdAt')
            .populate({
                path: 'student',
                select: 'name email role'
            })
            .populate({
                path: 'replies.user',
                select: 'name email role'
            });

        const queries = await query;

        res.status(200).json({
            success: true,
            count: queries.length,
            data: queries
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single query
// @route   GET /api/queries/:id
// @access  Private
exports.getQuery = async (req, res) => {
    try {
        const query = await Query.findById(req.params.id)
            .populate('student', 'name email role')
            .populate({
                path: 'replies.user',
                select: 'name email role'
            });

        if (!query) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        // Make sure students can only access their own queries
        if (req.user.role === 'student' && query.student._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this query' });
        }

        res.status(200).json({ success: true, data: query });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create new query
// @route   POST /api/queries
// @access  Private (Students only)
exports.createQuery = async (req, res) => {
    try {
        const { title, description } = req.body;

        const newQuery = await Query.create({
            title,
            description,
            student: req.user.id,
            status: 'open'
        });

        // Optionally, fetch full populated query to return
        const populatedQuery = await Query.findById(newQuery._id).populate('student', 'name email role');

        res.status(201).json({
            success: true,
            data: populatedQuery
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reply to query
// @route   POST /api/queries/:id/reply
// @access  Private (Alumni, Admin)
exports.replyToQuery = async (req, res) => {
    try {
        const query = await Query.findById(req.params.id);

        if (!query) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        if (query.status === 'resolved') {
            return res.status(400).json({ success: false, message: 'Cannot reply to a resolved query' });
        }

        const newReply = {
            user: req.user.id,
            text: req.body.text
        };

        query.replies.push(newReply);
        await query.save();

        // Send a notification to the student about the reply
        await Notification.create({
            user: query.student,
            message: `${req.user.name} has replied to your query: "${query.title}"`,
            type: 'query_reply'
        });

        const updatedQuery = await Query.findById(req.params.id)
            .populate('student', 'name email role')
            .populate('replies.user', 'name email role');

        res.status(200).json({
            success: true,
            data: updatedQuery
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Resolve query
// @route   PUT /api/queries/:id/resolve
// @access  Private (Student who created it, Admin)
exports.resolveQuery = async (req, res) => {
    try {
        let query = await Query.findById(req.params.id);

        if (!query) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        // Ownership check
        if (req.user.role !== 'admin' && query.student.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to resolve this query' });
        }

        query.status = 'resolved';
        await query.save();

        const updatedQuery = await Query.findById(req.params.id)
            .populate('student', 'name email role')
            .populate('replies.user', 'name email role');

        res.status(200).json({
            success: true,
            data: updatedQuery
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete query
// @route   DELETE /api/queries/:id
// @access  Private (Admin)
exports.deleteQuery = async (req, res) => {
    try {
        const query = await Query.findById(req.params.id);

        if (!query) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this query' });
        }

        await query.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
