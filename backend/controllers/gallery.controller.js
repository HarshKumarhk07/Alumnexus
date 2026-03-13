const Gallery = require('../models/gallery.model');

// @desc    Get Gallery Media
// @route   GET /api/gallery
// @access  Public
exports.getGallery = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) query.category = category;

        const media = await Gallery.find(query).populate('uploadedBy', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: media.length, data: media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Upload to Gallery
// @route   POST /api/gallery
// @access  Private (Admin/Verified Alumni)
exports.uploadMedia = async (req, res) => {
    try {
        const uploadedBy = req.user._id;

        // If files were uploaded via Multer upload.array()
        if (req.files && req.files.length > 0) {
            const mediaDocs = req.files.map(file => ({
                mediaURL: file.path,
                category: req.body.category,
                caption: req.body.caption,
                uploadedBy
            }));
            const media = await Gallery.insertMany(mediaDocs);
            return res.status(201).json({ success: true, data: media });
        }

        // Fallback backward compatibility for single upload or URL
        req.body.uploadedBy = uploadedBy;
        if (req.file) {
            req.body.mediaURL = req.file.path;
        }

        if (!req.body.mediaURL) {
            return res.status(400).json({ success: false, message: 'Please provide an image URL or upload image files.' });
        }

        const media = await Gallery.create(req.body);
        res.status(201).json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @route   DELETE /api/gallery/:id
// @access  Private (Admin)
exports.deleteMedia = async (req, res) => {
    try {
        const media = await Gallery.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        // Check if user is admin or the owner of the media
        if (req.user.role !== 'admin' && media.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this media' });
        }

        await media.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
