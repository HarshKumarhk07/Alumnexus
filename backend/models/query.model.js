const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Please add text for this reply']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const QuerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a question title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    replies: [ReplySchema],
    status: {
        type: String,
        enum: ['open', 'resolved'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Query', QuerySchema);
