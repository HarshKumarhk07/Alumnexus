const mongoose = require('mongoose');

const surveyOptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    }
});

const surveySchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [surveyOptionSchema],
    votedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    targetRole: {
        type: String,
        enum: ['all', 'student', 'alumni'],
        default: 'all'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Survey', surveySchema);
