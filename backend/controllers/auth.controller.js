const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    let {
        name, email, password, role,
        batchYear, branch, rollNumber, company, designation, linkedin,
        github, careerInterest, year, skills, projects
    } = req.body;

    // Sanitize email
    if (email) email = email.trim().toLowerCase();

    // Secondary Regex Validation (Backend)
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    try {
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            isVerified: false // Default to false for all new users to stay secure
        });

        // Automatically provision an Alumni Profile for Verification
        if (role === 'alumni') {
            const AlumniProfile = require('../models/alumniProfile.model');
            await AlumniProfile.create({
                user: user._id,
                batchYear,
                branch,
                rollNumber,
                company,
                designation,
                linkedin,
                verificationStatus: 'pending'
            });
        }

        // Provision a Student Profile
        if (role === 'student') {
            const StudentProfile = require('../models/studentProfile.model');

            let parsedProjects = [];
            if (projects) {
                try {
                    parsedProjects = typeof projects === 'string' ? JSON.parse(projects) : projects;
                } catch (e) {
                    console.error("Failed to parse projects from FormData", e);
                }
            }

            let parsedSkills = [];
            if (skills) {
                try {
                    parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
                } catch (e) {
                    if (typeof skills === 'string') {
                        parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
                    }
                }
            }

            await StudentProfile.create({
                user: user._id,
                branch: branch || 'Not Specified',
                year: year || 1,
                skills: parsedSkills,
                projects: parsedProjects,
                linkedin: linkedin || '',
                github: github || '',
                careerInterest: careerInterest || '',
                resumeURL: req.file ? req.file.path : ''
            });
        }

        sendTokenResponse(user, 201, res);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    let { email, password } = req.body;

    // Sanitize email
    if (email) email = email.trim().toLowerCase();

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    try {
        console.log(`Login attempt for email: [${email}]`);
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log(`User not found for email: [${email}]`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log(`User found. Comparing passwords...`);
        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log(`Password mismatch for user: [${email}]`);
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log(`Login successful for: [${email}]`);
        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(`Login error: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;

        // Check if email is already taken by someone else
        if (email && email !== req.user.email) {
            const existing = await User.findOne({ email });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        console.log(`[AUTH] updatePassword request for user: ${user.email}`);
        console.log(`[AUTH] Submitted currentPassword: ${currentPassword ? '*' : 'MISSING'}`);

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        console.log(`[AUTH] isMatch result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save(); // pre-save hook handles hashing

        // Generate new token using standard helper
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            message: 'Password updated successfully'
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
