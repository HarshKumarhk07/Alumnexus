const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Event = require('./models/event.model');

async function fixEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Logic: 
        // 1. If it has a meetingLink, it's online.
        // 2. If it has a location (and no link), it's offline.
        // 3. If it has neither, well... let's default to offline to remove the "Join Meeting" button confusion.

        const events = await Event.find({});
        console.log(`Checking ${events.length} events...`);

        for (const event of events) {
            let updated = false;

            if (event.meetingLink && event.meetingLink.trim() !== '') {
                if (event.meetingType !== 'online') {
                    event.meetingType = 'online';
                    updated = true;
                }
            } else if (event.location && event.location.trim() !== '') {
                if (event.meetingType !== 'offline') {
                    event.meetingType = 'offline';
                    updated = true;
                }
            } else {
                // No link, no location. Default to offline to be safe.
                if (event.meetingType !== 'offline') {
                    event.meetingType = 'offline';
                    updated = true;
                }
            }

            if (updated) {
                await event.save();
                console.log(`Updated event: ${event.title} -> ${event.meetingType}`);
            }
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixEvents();
