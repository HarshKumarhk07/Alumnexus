const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    package: {
        type: String
    },
    deadline: {
        type: Date
    },
    applyLink: {
        type: String,
        required: false
    },
    applicants: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
