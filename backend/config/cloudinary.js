const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'alumnexus/gallery', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});

const upload = multer({ storage: storage });

// Configure Storage Engine for Resumes
const documentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        return {
            folder: 'alumnexus/resumes',
            format: 'pdf', // Explicitly tell Cloudinary this is a PDF
            public_id: `resume-${uniqueSuffix}`
        };
    }
});

const uploadResume = multer({ storage: documentStorage });

module.exports = {
    cloudinary,
    upload,
    uploadResume
};
