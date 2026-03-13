const express = require('express');
const router = express.Router();
const { getGallery, uploadMedia, deleteMedia } = require('../controllers/gallery.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getGallery);
router.post('/', protect, authorize('admin', 'alumni'), requireVerified, upload.array('images', 50), uploadMedia);
router.delete('/:id', protect, authorize('admin', 'alumni'), deleteMedia);

module.exports = router;
