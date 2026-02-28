const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['mentorship', 'resume-review', 'referral'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        maxlength: 500
    },
    response: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);
