const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Gallery = require('./models/gallery.model');
const User = require('./models/user.model');

dotenv.config({ path: './.env' });

async function checkGallery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const media = await Gallery.find().populate('uploadedBy', 'name email').lean();
        console.log(`Found ${media.length} media items`);

        media.slice(0, 15).forEach((item, index) => {
            console.log(`\nItem ${index + 1}:`);
            console.log(`ID: ${item._id}`);
            console.log(`Caption: ${item.caption}`);
            console.log(`UploadedBy: ${JSON.stringify(item.uploadedBy)}`);
            if (item.uploadedBy) {
                console.log(`UploadedBy ID: ${item.uploadedBy._id}`);
            }
        });

        const users = await User.find({ role: 'alumni' }).select('name email').lean();
        console.log('\nAlumni Users:');
        users.forEach(u => console.log(`${u.name} (${u.email}) - ID: ${u._id}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkGallery();
