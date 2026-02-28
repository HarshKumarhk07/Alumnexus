require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/event.model.js');

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://harshvardhanpoudel:harman@cluster0.eom3c.mongodb.net/campus-connect?retryWrites=true&w=majority&appName=Cluster0').then(async () => {
    try {
        const events = await Event.find().sort({ _id: -1 }).limit(5);
        console.log(JSON.stringify(events, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
});
