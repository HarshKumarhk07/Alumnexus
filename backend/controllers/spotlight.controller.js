const Spotlight = require('../models/spotlight.model');

// @desc    Get Current Spotlight
// @route   GET /api/admin/spotlight
// @access  Public
exports.getSpotlight = async (req, res) => {
    try {
        const spotlight = await Spotlight.findOne({ isPublished: true }).sort({ createdAt: -1 });
        if (!spotlight) {
            return res.status(200).json({ success: true, data: null });
        }
        res.status(200).json({ success: true, data: spotlight });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update Spotlight (Admin Only)
// @route   POST /api/admin/spotlight
// @access  Private/Admin
exports.updateSpotlight = async (req, res) => {
    try {
        const { title, description, quote, authorName, authorRole, isPublished } = req.body;
        let image = req.body.image;

        if (req.file) {
            image = req.file.path; // Cloudinary URL
        }

        // Unpublish others if this is being published
        if (isPublished === 'true' || isPublished === true) {
            await Spotlight.updateMany({}, { isPublished: false });
        }

        const spotlight = await Spotlight.create({
            title,
            description,
            quote,
            authorName,
            authorRole,
            image,
            isPublished: isPublished === 'true' || isPublished === true
        });

        res.status(201).json({ success: true, data: spotlight });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
