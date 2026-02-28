const express = require('express');
const {
    getJobs,
    getMyJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    withdrawFromJob,
    getJobApplicants
} = require('../controllers/job.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');

const router = express.Router();

router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('alumni', 'admin'), getMyJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('alumni', 'admin'), requireVerified, createJob);
router.put('/:id', protect, authorize('alumni', 'admin'), updateJob);
router.delete('/:id', protect, authorize('alumni', 'admin'), deleteJob);
router.put('/:id/apply', protect, authorize('student'), applyToJob);
router.put('/:id/withdraw', protect, authorize('student'), withdrawFromJob);
router.get('/:id/applicants', protect, authorize('alumni', 'admin'), getJobApplicants);

module.exports = router;
