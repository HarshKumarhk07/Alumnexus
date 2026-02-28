const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    skills: [String],
    projects: [{
        title: String,
        description: String,
        link: String
    }],
    resumeURL: {
        type: String
    },
    linkedin: {
        type: String
    },
    github: {
        type: String
    },
    careerInterest: {
        type: String
    },
    profilePhoto: {
        type: String,
        default: 'no-photo.jpg'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
