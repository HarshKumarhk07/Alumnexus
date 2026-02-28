const AlumniProfile = require('../models/alumniProfile.model');
const StudentProfile = require('../models/studentProfile.model');
const User = require('../models/user.model');

// @desc    Get all alumni profiles
// @route   GET /api/profiles/alumni
// @access  Public
exports.getAlumniProfiles = async (req, res) => {
    try {
        // Find all users with role 'alumni'
        const users = await User.find({ role: 'alumni' }).select('name email');

        // Find all alumni profiles
        const profiles = await AlumniProfile.find();

        // Merge profiles into users
        const alumniData = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            return {
                _id: profile ? profile._id : `temp-${user._id}`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                batchYear: profile ? profile.batchYear : 'N/A',
                branch: profile ? profile.branch : 'Not Set',
                designation: profile ? profile.designation : 'Alumnus',
                company: profile ? profile.company : 'CampusConnect',
                location: profile ? profile.location : '',
                skills: profile ? profile.skills : [],
                linkedin: profile ? profile.linkedin : 'https://linkedin.com',
                portfolio: profile ? profile.portfolio : '',
                mentorshipAvailable: profile ? profile.mentorshipAvailable : false,
                resumeReview: profile ? profile.resumeReview : false,
                referrals: profile ? profile.referrals : false,
                profilePhoto: profile ? profile.profilePhoto : 'no-photo.jpg',
                bio: profile ? profile.bio : '',
                verificationStatus: profile ? profile.verificationStatus : 'approved' // Default to approved for listing if no profile exists yet
            };
        });

        res.status(200).json({ success: true, count: alumniData.length, data: alumniData });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create or update alumni profile
// @route   POST /api/profiles/alumni
// @access  Private (Alumni/Admin)
exports.upsertAlumniProfile = async (req, res) => {
    req.body.user = req.user.id;

    if (req.file) {
        req.body.profilePhoto = req.file.path; // Cloudinary URL automatically provided by multer-storage-cloudinary
    }

    try {
        let profile = await AlumniProfile.findOne({ user: req.user.id });

        if (profile) {
            profile = await AlumniProfile.findOneAndUpdate(
                { user: req.user.id },
                req.body,
                { new: true, runValidators: true }
            );
        } else {
            profile = await AlumniProfile.create(req.body);
        }

        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get student profile
// @route   GET /api/profiles/student/:userId
// @access  Private
exports.getStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.params.userId }).populate('user', 'name email');
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in alumni profile
// @route   GET /api/profiles/alumni/me
// @access  Private (Alumni/Admin)
exports.getMeAlumniProfile = async (req, res) => {
    try {
        const profile = await AlumniProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(200).json({ success: true, data: null });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in student profile
// @route   GET /api/profiles/student/me
// @access  Private (Student)
exports.getMeStudentProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email');
        if (!profile) {
            return res.status(200).json({ success: true, data: null });
        }
        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create or update student profile
// @route   POST /api/profiles/student
// @access  Private (Student)
exports.upsertStudentProfile = async (req, res) => {
    req.body.user = req.user.id;

    if (req.file) {
        req.body.resumeURL = req.file.path; // New resume from Cloudinary
    }

    try {
        let profile = await StudentProfile.findOne({ user: req.user.id });

        // Parse skills and projects if they arrive as strings
        if (req.body.skills && typeof req.body.skills === 'string') {
            try { req.body.skills = JSON.parse(req.body.skills); }
            catch { req.body.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean); }
        }

        if (req.body.projects && typeof req.body.projects === 'string') {
            try { req.body.projects = JSON.parse(req.body.projects); } catch (e) { }
        }

        if (profile) {
            profile = await StudentProfile.findOneAndUpdate(
                { user: req.user.id },
                req.body,
                { new: true, runValidators: true }
            );
        } else {
            profile = await StudentProfile.create(req.body);
        }

        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Upload student profile photo
// @route   POST /api/profiles/student/photo
// @access  Private (Student)
exports.uploadStudentPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a image file' });
        }

        let profile = await StudentProfile.findOne({ user: req.user.id });

        if (!profile) {
            // Create a barebones profile if they somehow haven't registered one but are uploading a photo
            profile = await StudentProfile.create({
                user: req.user.id,
                branch: 'Not Set',
                year: 1,
                profilePhoto: req.file.path
            });
        } else {
            profile = await StudentProfile.findOneAndUpdate(
                { user: req.user.id },
                { profilePhoto: req.file.path },
                { new: true, runValidators: true }
            );
        }

        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
