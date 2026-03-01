const Survey = require('../models/survey.model');

// @desc    Create a survey/poll (Admin only)
// @route   POST /api/surveys
// @access  Private/Admin
exports.createSurvey = async (req, res) => {
    try {
        const { question, options, targetRole } = req.body;

        if (!question || !options || options.length < 2) {
            return res.status(400).json({ success: false, message: 'Please provide a question and at least two options' });
        }

        const surveyOptions = options.map(opt => ({ text: opt, votes: 0 }));

        const survey = await Survey.create({
            question,
            options: surveyOptions,
            targetRole: targetRole || 'all',
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: survey });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get surveys based on user role (Admin sees all with votes, User sees targeted ones without vote totals if they haven't voted, or just marks them as voted)
// @route   GET /api/surveys
// @access  Private
exports.getSurveys = async (req, res) => {
    try {
        let query = { isActive: true };

        // If user is not admin, only show polls targeted at 'all' or their specific role
        if (req.user.role !== 'admin') {
            query.targetRole = { $in: ['all', req.user.role] };
        }

        // Fetch surveys
        const surveys = await Survey.find(query).sort({ createdAt: -1 });

        // Format surveys based on role
        const formattedSurveys = surveys.map(survey => {
            const hasVoted = survey.votedUsers.includes(req.user.id);
            const surveyObj = survey.toObject();

            // Only admin sees the actual vote counts. Users only see if they have voted.
            // If they are not admin, we strip the exact vote count to meet the requirement "data should be hidden from other users"
            if (req.user.role !== 'admin') {
                surveyObj.options = surveyObj.options.map(opt => ({
                    _id: opt._id,
                    text: opt.text
                    // omitting 'votes'
                }));
            }

            return {
                ...surveyObj,
                hasVoted,
                totalVotes: req.user.role === 'admin' ? survey.votedUsers.length : undefined
            };
        });

        res.status(200).json({ success: true, data: formattedSurveys });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Vote on a survey
// @route   PUT /api/surveys/:id/vote
// @access  Private
exports.voteSurvey = async (req, res) => {
    try {
        const { optionId } = req.body;
        const survey = await Survey.findById(req.params.id);

        if (!survey) {
            return res.status(404).json({ success: false, message: 'Survey not found' });
        }

        if (!survey.isActive) {
            return res.status(400).json({ success: false, message: 'This survey is closed' });
        }

        if (survey.votedUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You have already voted' });
        }

        const option = survey.options.id(optionId);
        if (!option) {
            return res.status(404).json({ success: false, message: 'Invalid option' });
        }

        option.votes += 1;
        survey.votedUsers.push(req.user.id);

        await survey.save();

        res.status(200).json({ success: true, message: 'Vote submitted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete survey (Admin only)
// @route   DELETE /api/surveys/:id
// @access  Private/Admin
exports.deleteSurvey = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) {
            return res.status(404).json({ success: false, message: 'Survey not found' });
        }

        await Survey.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Survey deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
