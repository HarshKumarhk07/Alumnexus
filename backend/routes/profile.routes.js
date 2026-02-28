const express = require('express');
const {
    getAlumniProfiles, upsertAlumniProfile, getStudentProfile, getMeAlumniProfile,
    getMeStudentProfile, upsertStudentProfile, uploadStudentPhoto,
    createRequest, getSentRequests, getReceivedRequests, updateRequestStatus,
    getStudentProfiles
} = require('../controllers/profile.controller');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadResume } = require('../config/cloudinary');

const router = express.Router();

router.get('/alumni', getAlumniProfiles);
router.get('/students', protect, authorize('alumni', 'admin'), getStudentProfiles);
router.get('/alumni/me', protect, authorize('alumni', 'admin'), getMeAlumniProfile);
router.post('/alumni', protect, authorize('alumni', 'admin'), upload.single('profilePhoto'), upsertAlumniProfile);
router.get('/student/me', protect, authorize('student'), getMeStudentProfile);
router.post('/student', protect, authorize('student'), uploadResume.single('resume'), upsertStudentProfile);
router.post('/student/photo', protect, authorize('student'), upload.single('profilePhoto'), uploadStudentPhoto);
router.get('/student/:userId', protect, getStudentProfile);

// Request routes
router.post('/requests', protect, authorize('student'), createRequest);
router.get('/requests/sent', protect, authorize('student'), getSentRequests);
router.get('/requests/received', protect, authorize('alumni', 'admin'), getReceivedRequests);
router.put('/requests/:id', protect, authorize('alumni', 'admin'), updateRequestStatus);

module.exports = router;
