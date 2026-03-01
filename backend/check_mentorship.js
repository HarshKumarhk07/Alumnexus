const mongoose = require('mongoose');
const User = require('./models/user.model');
const AlumniProfile = require('./models/alumniProfile.model');
const Request = require('./models/request.model');
const Notification = require('./models/notification.model');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const ishan = await User.findOne({ name: 'ishan kishan' });
        if (ishan) {
            const profile = await AlumniProfile.findOne({ user: ishan._id });
            console.log(`Ishan Kishan Profile:`, {
                mentorshipAvailable: profile?.mentorshipAvailable,
                resumeReview: profile?.resumeReview,
                referrals: profile?.referrals,
                verificationStatus: profile?.verificationStatus
            });
        }

        const heman = await User.findOne({ name: 'heman' });
        if (heman) {
            const profile = await AlumniProfile.findOne({ user: heman._id });
            console.log(`Heman Profile:`, {
                mentorshipAvailable: profile?.mentorshipAvailable,
                resumeReview: profile?.resumeReview,
                referrals: profile?.referrals,
                verificationStatus: profile?.verificationStatus
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
