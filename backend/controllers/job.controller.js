const Job = require('../models/job.model');
const StudentProfile = require('../models/studentProfile.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).populate('postedBy', 'name');
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get my posted jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Alumni)
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).populate('postedBy', 'name');
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name');

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Alumni/Admin)
exports.createJob = async (req, res) => {
    req.body.postedBy = req.user.id;

    try {
        const job = await Job.create(req.body);

        // Notify only Students
        const User = require('../models/user.model');
        const Notification = require('../models/notification.model');
        const students = await User.find({ role: 'student' });

        const notifications = students.map(student => ({
            user: student._id,
            message: `New Job Opportunity: ${job.role} at ${job.company}`,
            type: 'info'
        }));
        await Notification.insertMany(notifications);

        res.status(201).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Alumni/Admin)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a job
exports.deleteJob = async (req, res) => {
    try {
        console.log(`Attempting to delete job: ${req.params.id} by user: ${req.user.id}`);
        const job = await Job.findById(req.params.id);

        if (!job) {
            console.log(`Job not found: ${req.params.id}`);
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this job' });
        }

        await job.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(`Delete job error: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Apply to a job
exports.applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if user already applied
        const alreadyApplied = job.applicants.find(
            applicant => applicant.user.toString() === req.user.id
        );

        if (alreadyApplied) {
            return res.status(400).json({ success: false, message: 'Already applied to this job' });
        }

        job.applicants.push({ user: req.user.id });
        await job.save();

        res.status(200).json({ success: true, message: 'Application submitted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Withdraw from a job
exports.withdrawFromJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if user applied
        const appliedIndex = job.applicants.findIndex(
            applicant => applicant.user.toString() === req.user.id
        );

        if (appliedIndex === -1) {
            return res.status(400).json({ success: false, message: 'Not applied to this job' });
        }

        job.applicants.splice(appliedIndex, 1);
        await job.save();

        res.status(200).json({ success: true, message: 'Application withdrawn successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get job applicants
exports.getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            console.log(`Unauthorized view applicants. PostedBy: ${job.postedBy.toString()}, ReqUser: ${req.user._id.toString()}`);
            return res.status(401).json({ success: false, message: 'Not authorized to view applicants' });
        }

        // Get applicants with user and student profile (for resume)
        const applicantsData = await Promise.all(
            job.applicants.map(async (applicant) => {
                const student = await StudentProfile.findOne({ user: applicant.user }).populate('user', 'name email');
                if (!student) {
                    // Fetch user directly if profile is missing
                    const User = require('../models/user.model');
                    const user = await User.findById(applicant.user).select('name email');
                    return {
                        user: user,
                        resumeURL: null,
                        appliedAt: applicant.appliedAt
                    };
                }
                return {
                    user: student.user,
                    resumeURL: student.resumeURL,
                    appliedAt: applicant.appliedAt
                };
            })
        );

        res.status(200).json({ success: true, count: applicantsData.length, data: applicantsData });
    } catch (err) {
        console.error(`Get applicants error: ${err.message}`);
        res.status(400).json({ success: false, message: err.message });
    }
};
