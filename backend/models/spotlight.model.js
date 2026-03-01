const mongoose = require('mongoose');

const SpotlightSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    quote: {
        type: String,
        required: [true, 'Please add a quote']
    },
    authorName: {
        type: String,
        required: [true, 'Please add author name']
    },
    authorRole: {
        type: String,
        required: [true, 'Please add author role']
    },
    image: {
        type: String,
        required: [true, 'Please add an image']
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Spotlight', SpotlightSchema);
