const express = require('express');
const router = express.Router();
const {
    getBlogs,
    createBlog,
    updateBlog,
    uploadCoverImage,
    likeBlog,
    addComment,
    deleteComment,
    deleteBlog
} = require('../controllers/blog.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getBlogs);
router.post('/', protect, authorize('alumni', 'admin'), requireVerified, upload.single('image'), createBlog);
router.put('/like/:id', protect, likeBlog);
router.put('/:id', protect, updateBlog);
router.post('/:id/cover-image', protect, upload.single('image'), uploadCoverImage);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
