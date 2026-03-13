const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Gallery = require('./models/gallery.model');
const User = require('./models/user.model');

dotenv.config({ path: './.env' });

async function checkGallery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const abhay = await User.findOne({ email: 'abhay@gmail.com' });
        if (!abhay) {
            console.log('Abhay not found');
            process.exit(1);
        }
        console.log(`Abhay ID: ${abhay._id}`);

        const allMedia = await Gallery.find().populate('uploadedBy', 'name').lean();
        console.log(`Total media: ${allMedia.length}`);

        const abhayMedia = allMedia.filter(m => m.uploadedBy && m.uploadedBy._id.toString() === abhay._id.toString());
        console.log(`Media by Abhay: ${abhayMedia.length}`);

        abhayMedia.forEach(m => {
            console.log(`- ID: ${m._id}, Caption: ${m.caption}, Date: ${m.createdAt}`);
        });

        const noUploaderMedia = allMedia.filter(m => !m.uploadedBy);
        console.log(`Media with NO uploader: ${noUploaderMedia.length}`);
        noUploaderMedia.forEach(m => {
            console.log(`- ID: ${m._id}, Caption: ${m.caption}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkGallery();
