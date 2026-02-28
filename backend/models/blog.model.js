const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        text: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    coverImage: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
