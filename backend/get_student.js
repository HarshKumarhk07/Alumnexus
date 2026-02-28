const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        let student = await User.findOne({ role: 'student' });

        if (!student) {
            console.log("No student found, creating one...");
            student = await User.create({
                name: 'Test Student',
                email: 'student@test.com',
                password: 'password123',
                role: 'student',
                status: 'approved'
            });
        } else {
            console.log(`Found student: ${student.email}. Resetting password to 'password123'`);
            student.password = 'password123';
            student.status = 'approved';
            await student.save();
        }

        console.log(`\n--- STUDENT CREDENTIALS ---`);
        console.log(`Email: ${student.email}`);
        console.log(`Password: password123`);
        console.log(`Status: ${student.status || 'active'}`);
        console.log(`---------------------------\n`);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

run();
