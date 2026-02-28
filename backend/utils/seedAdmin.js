const User = require('../models/user.model');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

dotenv.config({ path: './.env' });

const seedAdmin = async () => {
    try {
        await connectDB();

        const admins = [
            {
                name: 'Super Admin',
                email: 'admin@alumnexus.com',
                password: 'adminpassword123',
                role: 'admin',
                isVerified: true
            },
            {
                name: 'Secondary Admin',
                email: 'superadmin@alumnexus.com',
                password: 'adminpassword123',
                role: 'admin',
                isVerified: true
            }
        ];

        for (const adminData of admins) {
            const adminExists = await User.findOne({ email: adminData.email });
            if (!adminExists) {
                await User.create(adminData);
                console.log(`Admin user ${adminData.email} created successfully`);
            } else {
                console.log(`Admin user ${adminData.email} already exists`);
            }
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
