const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    speaker: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    speakerName: String,
    dateTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    meetingType: {
        type: String,
        enum: ['online', 'offline'],
        default: 'online'
    },
    meetingLink: {
        type: String
    },
    location: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    registeredStudents: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    banner: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
