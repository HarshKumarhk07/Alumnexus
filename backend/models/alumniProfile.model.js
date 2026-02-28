const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rollNumber: {
        type: String
    },
    batchYear: {
        type: Number,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    linkedin: {
        type: String
    },
    portfolio: {
        type: String
    },
    skills: [String],
    projects: [{
        title: String,
        description: String,
        link: String
    }],
    mentorshipAvailable: {
        type: Boolean,
        default: false
    },
    resumeReview: {
        type: Boolean,
        default: false
    },
    referrals: {
        type: Boolean,
        default: false
    },
    profilePhoto: {
        type: String,
        default: 'no-photo.jpg'
    },
    bio: {
        type: String,
        maxlength: 500
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AlumniProfile', alumniProfileSchema);
