const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Event = require('./models/event.model');

async function checkEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const events = await Event.find().limit(10).lean();
        console.log('Recent Events:');
        events.forEach(e => {
            console.log(`- Title: ${e.title}, Type: ${e.meetingType}, Location: ${e.location}, Link: ${e.meetingLink}`);
        });

        const spectra = await Event.findOne({ title: /spectra/i }).lean();
        if (spectra) {
            console.log('\nSpectra Event Details:');
            console.log(JSON.stringify(spectra, null, 2));
        } else {
            console.log('\nSpectra event not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEvents();
