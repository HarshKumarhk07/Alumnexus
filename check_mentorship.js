const mongoose = require('mongoose');
const User = require('./backend/models/user.model');
const AlumniProfile = require('./backend/models/alumniProfile.model');
const Request = require('./backend/models/request.model');
const Notification = require('./backend/models/notification.model');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'alumni' });
        console.log(`Found ${users.length} alumni users`);

        for (const user of users) {
            const profile = await AlumniProfile.findOne({ user: user._id });
            console.log(`User: ${user.name} (${user._id}) -> Profile: ${profile ? 'Found' : 'NOT FOUND'} (${profile?._id})`);
        }

        const requests = await Request.find().populate('sender receiver');
        console.log(`Found ${requests.length} total requests`);
        requests.forEach(r => {
            console.log(`Request type: ${r.type}, sender: ${r.sender?.name} (${r.sender?._id}), receiver: ${r.receiver?.name} (${r.receiver?._id}), status: ${r.status}`);
        });

        const notifications = await Notification.find().sort('-createdAt').limit(5);
        console.log(`Found ${notifications.length} recent notifications`);
        notifications.forEach(n => {
            console.log(`Notification for: ${n.user}, message: ${n.message}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
