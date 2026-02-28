const express = require('express');
const router = express.Router();
const {
    getBlogs,
    createBlog,
    likeBlog,
    addComment,
    deleteComment
} = require('../controllers/blog.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getBlogs);
router.post('/', protect, authorize('alumni', 'admin'), requireVerified, upload.single('image'), createBlog);
router.put('/like/:id', protect, likeBlog);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;
