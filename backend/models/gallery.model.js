const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    mediaURL: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Events'
    },
    caption: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
