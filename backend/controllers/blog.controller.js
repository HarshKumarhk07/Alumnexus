const Blog = require('../models/blog.model');

// @desc    Get All Blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) query.category = category;

        const blogs = await Blog.find(query)
            .populate('author', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: blogs.length, data: blogs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create Blog
// @route   POST /api/blogs
// @access  Private (Alumni/Admin)
exports.createBlog = async (req, res) => {
    try {
        req.body.author = req.user._id;

        if (req.file) {
            req.body.coverImage = req.file.path;
        }

        const blog = await Blog.create(req.body);

        // Notify Students and Alumni
        const User = require('../models/user.model');
        const Notification = require('../models/notification.model');
        const users = await User.find({ role: { $in: ['student', 'alumni'] } });

        const notifications = users.map(user => ({
            user: user._id,
            message: `New Blog Post: ${blog.title}`,
            type: 'info'
        }));
        await Notification.insertMany(notifications);

        res.status(201).json({ success: true, data: blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Like Blog
// @route   PUT /api/blogs/like/:id
// @access  Private
exports.likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        if (blog.likes.includes(req.user._id)) {
            blog.likes = blog.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            blog.likes.push(req.user._id);
        }

        await blog.save();
        res.status(200).json({ success: true, data: blog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add Comment to Blog
// @route   POST /api/blogs/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const newComment = {
            user: req.user._id,
            text,
            date: Date.now()
        };

        blog.comments.push(newComment);
        await blog.save();

        // Repopulate user to return to frontend
        const populatedBlog = await Blog.findById(blog._id)
            .populate('author', 'name')
            .populate('comments.user', 'name');

        res.status(201).json({ success: true, data: populatedBlog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete Comment from Blog
// @route   DELETE /api/blogs/:id/comment/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Find the specific comment
        const comment = blog.comments.find(
            (c) => c._id.toString() === req.params.commentId
        );

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Verify the user owns the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized to delete this comment' });
        }

        // Remove the comment
        blog.comments = blog.comments.filter(
            (c) => c._id.toString() !== req.params.commentId
        );

        await blog.save();

        // Repopulate user to return to frontend
        const populatedBlog = await Blog.findById(blog._id)
            .populate('author', 'name')
            .populate('comments.user', 'name');

        res.status(200).json({ success: true, data: populatedBlog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Delete Blog
// @route   DELETE /api/blogs/:id
// @access  Private (Author/Admin)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Check if user is author or admin
        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this blog' });
        }

        await blog.deleteOne();
        res.status(200).json({ success: true, message: 'Blog removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
