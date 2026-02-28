const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let alumni = await User.findOne({ email: 'alumnus@alumnexus.com' });

        if (alumni) {
            console.log("Fixing double-hashed password...");
            alumni.password = 'password123'; // Mongoose pre-save middleware will hash this!
            await alumni.save();
            console.log("Password reset successfully. Try logging in now.");
        } else {
            console.log("User not found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

run();
