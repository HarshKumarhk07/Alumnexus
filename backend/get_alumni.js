const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let alumni = await User.findOne({ role: 'alumni' });

        if (!alumni) {
            console.log("No alumni found, creating one...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            alumni = await User.create({
                name: 'Test Alumni',
                email: 'alumni@test.com',
                password: hashedPassword,
                role: 'alumni',
                status: 'approved' // assuming there's an approval config
            });
        } else {
            console.log(`Found alumni: ${alumni.email}. Resetting password to 'password123'`);
            const salt = await bcrypt.genSalt(10);
            alumni.password = await bcrypt.hash('password123', salt);
            alumni.status = 'approved';
            await alumni.save();
        }

        console.log(`\n--- ALUMNI CREDENTIALS ---`);
        console.log(`Email: ${alumni.email}`);
        console.log(`Password: password123`);
        console.log(`Status: ${alumni.status}`);
        console.log(`--------------------------\n`);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

run();
