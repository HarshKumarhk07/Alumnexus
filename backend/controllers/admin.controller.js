const User = require('../models/user.model');
const AlumniProfile = require('../models/alumniProfile.model');
const StudentProfile = require('../models/studentProfile.model');
const Job = require('../models/job.model');
const Event = require('../models/event.model');
const Notification = require('../models/notification.model');
const Blog = require('../models/blog.model');
const sendEmail = require('../utils/sendEmail');

// @desc    Get Admin Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Total Counts
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const pendingAlumni = await AlumniProfile.countDocuments({ verificationStatus: 'pending' });
        const totalJobs = await Job.countDocuments({ isActive: true });

        // Growth Trends (New items in last 30 days)
        const newStudents = await User.countDocuments({
            role: 'student',
            createdAt: { $gte: thirtyDaysAgo }
        });
        const newAlumni = await User.countDocuments({
            role: 'alumni',
            createdAt: { $gte: thirtyDaysAgo }
        });
        const newJobs = await Job.countDocuments({
            isActive: true,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Calculate Percentages
        const studentGrowth = totalStudents > 0 ? ((newStudents / (totalStudents - newStudents || 1)) * 100).toFixed(0) : 0;
        const alumniGrowth = totalAlumni > 0 ? ((newAlumni / (totalAlumni - newAlumni || 1)) * 100).toFixed(0) : 0;
        const jobGrowth = totalJobs > 0 ? ((newJobs / (totalJobs - newJobs || 1)) * 100).toFixed(0) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalAlumni,
                pendingAlumni,
                totalJobs,
                trends: {
                    studentGrowth: `+${studentGrowth}%`,
                    alumniGrowth: `+${alumniGrowth}%`,
                    jobGrowth: `+${jobGrowth}%`
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Public Stats (for Students/Alumni)
// @route   GET /api/admin/public-stats
// @access  Private
exports.getPublicStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        const alumniCount = await AlumniProfile.countDocuments({ verificationStatus: 'approved' });
        const studentCount = await User.countDocuments({ role: 'student' });
        const activeJobs = await Job.countDocuments({ isActive: true });
        const mentors = await AlumniProfile.countDocuments({
            verificationStatus: 'approved',
            mentorshipAvailable: true
        });
        const insights = await Blog.countDocuments();

        // Trends (Simple mock or real based on growth)
        const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
        const newInsights = await Blog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

        const networkGrowth = alumniCount > 0 ? ((newUsers / (alumniCount || 1)) * 100).toFixed(0) : 0;
        const insightsGrowth = insights > 0 ? ((newInsights / (insights - newInsights || 1)) * 100).toFixed(0) : 0;

        res.status(200).json({
            success: true,
            data: {
                alumniCount,
                studentCount,
                activeJobs,
                mentors,
                insights,
                trends: {
                    networkGrowth: `+${networkGrowth}%`,
                    insightsGrowth: `+${insightsGrowth}%`
                }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get Pending Alumni
// @route   GET /api/admin/pending-alumni
// @access  Private/Admin
exports.getPendingAlumni = async (req, res) => {
    try {
        const pending = await AlumniProfile.find({ verificationStatus: 'pending' }).populate('user', 'name email');
        res.status(200).json({ success: true, data: pending });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Alumni Profile
// @route   PUT /api/admin/verify-alumni/:id
// @access  Private/Admin
exports.verifyAlumni = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const profile = await AlumniProfile.findByIdAndUpdate(req.params.id, { verificationStatus: status }, { new: true });

        if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

        // Update user's isVerified status if approved
        if (status === 'approved') {
            await User.findByIdAndUpdate(profile.user, { isVerified: true });

            // Send Notification
            await Notification.create({
                user: profile.user,
                message: 'Your alumni profile has been approved! Welcome back.',
                type: 'info'
            });

            // Send Email
            try {
                const user = await User.findById(profile.user);
                await sendEmail({
                    to: user.email,
                    subject: 'Alumni Account Approved',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #5A3E2B;">Congratulations ${user.name}!</h2>
                            <p>Your alumni profile for <strong>AlumNexus</strong> has been approved.</p>
                            <p>You can now access all alumni features, including job postings and mentoring.</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; padding: 10px 20px; background-color: #5A3E2B; color: white; text-decoration: none; border-radius: 5px; font-bold: true;">Login to AlumNexus</a>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error('Approval email failed to send:', emailErr.message);
            }
        }

        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get All Users with Filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let users = await User.find(query).lean();

        // If 'alumni' might be in the query results, fetch their profiles to append photo/company data
        if (!role || role === 'alumni') {
            const profiles = await AlumniProfile.find().lean();
            users = users.map(user => {
                if (user.role === 'alumni') {
                    const profile = profiles.find(p => p.user.toString() === user._id.toString());
                    return {
                        ...user,
                        profilePhoto: profile ? profile.profilePhoto : 'no-photo.jpg',
                        company: profile ? profile.company : '',
                        designation: profile ? profile.designation : ''
                    };
                }
                return user;
            });
        }

        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Export Users to CSV
// @route   GET /api/admin/export-users
// @access  Private/Admin
exports.exportUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name email role isVerified createdAt');

        let csv = 'Name,Email,Role,Verified,Joined Date\n';
        users.forEach(user => {
            csv += `${user.name},${user.email},${user.role},${user.isVerified},${user.createdAt}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Export Students to CSV
// @route   GET /api/admin/export-students
// @access  Private/Admin
exports.exportStudents = async (req, res) => {
    try {
        const StudentProfile = require('../models/studentProfile.model');
        const users = await User.find({ role: 'student' }).select('name email isVerified createdAt');
        const profiles = await StudentProfile.find();

        let csv = 'Name,Email,Branch,Year,Career Interest,Skills,LinkedIn,GitHub,Verified,Joined Date\n';
        users.forEach(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            const branch = profile?.branch || 'Not Set';
            const year = profile?.year || 'N/A';
            const interest = profile?.careerInterest || '';
            const skills = (profile?.skills || []).join('; ');
            const linkedin = profile?.linkedin || '';
            const github = profile?.github || '';
            // Wrap fields with commas in quotes
            csv += `"${user.name}","${user.email}","${branch}","${year}","${interest}","${skills}","${linkedin}","${github}",${user.isVerified},"${new Date(user.createdAt).toLocaleDateString()}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Post Global Announcement
// @route   POST /api/admin/announcement
// @access  Private/Admin
exports.postAnnouncement = async (req, res) => {
    try {
        const { title, message, targetRole, targetUsers, specificUser } = req.body; // targetRole: 'all', 'student', 'alumni', 'specific'

        let userQuery = {};
        if (targetRole === 'specific') {
            if (!targetUsers || targetUsers.length === 0) {
                return res.status(400).json({ success: false, message: 'Please select at least one user' });
            }
            userQuery._id = { $in: targetUsers };
        } else if (targetRole !== 'all') {
            userQuery.role = targetRole;
            // Handle if a specific user within that role was provided
            if (specificUser) {
                userQuery._id = specificUser;
            }
        }

        const users = await User.find(userQuery);

        const notifications = users.map(user => ({
            user: user._id,
            message: message,
            type: 'announcement'
        }));

        await Notification.insertMany(notifications);

        res.status(200).json({ success: true, message: `Announcement sent to ${users.length} users` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send Bulk Email
// @route   POST /api/admin/bulk-email
// @access  Private/Admin
exports.sendBulkEmail = async (req, res) => {
    try {
        const { subject, message, targetRole } = req.body;

        let userQuery = {};
        if (targetRole !== 'all') userQuery.role = targetRole;

        const users = await User.find(userQuery);

        // In a real app, use a queue like BullMQ for background emailing
        for (const user of users) {
            try {
                await sendEmail({
                    to: user.email,
                    subject: subject,
                    html: `<div style="font-family: sans-serif;">${message}</div>`
                });
            } catch (mailErr) {
                console.error(`Failed to send email to ${user.email}`);
            }
        }

        res.status(200).json({ success: true, message: `Emails sent to ${users.length} users` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get All Jobs for Admin
// @route   GET /api/admin/jobs
// @access  Private/Admin
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
        }

        // Delete associated profiles
        if (user.role === 'alumni') {
            await AlumniProfile.findOneAndDelete({ user: user._id });
        } else if (user.role === 'student') {
            await StudentProfile.findOneAndDelete({ user: user._id });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'User and associated profiles deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update User/Alumni Status (Approve/Revoke)
// @route   PUT /api/admin/users/status/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
    console.log('>>> HIT: updateUserStatus for ID:', req.params.id);
    try {
        const { status, isVerified } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update User verification status using findByIdAndUpdate to bypass hooks
        if (typeof isVerified === 'boolean') {
            await User.findByIdAndUpdate(req.params.id, { isVerified }, { new: true });
        }

        // If it's an alumni, update their profile status too
        if (user.role === 'alumni') {
            const profile = await AlumniProfile.findOne({ user: user._id });
            if (profile && status) {
                await AlumniProfile.findByIdAndUpdate(profile._id, { verificationStatus: status }, { new: true });
            }
        }

        res.status(200).json({
            success: true,
            message: `User status updated to ${isVerified ? 'Verified' : 'Unverified'}`,
            data: { id: req.params.id, isVerified }
        });
    } catch (err) {
        console.error('Update User Status Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

