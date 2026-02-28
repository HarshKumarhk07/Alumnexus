const express = require('express');
const {
    getAlumniProfiles, upsertAlumniProfile, getStudentProfile, getMeAlumniProfile,
    getMeStudentProfile, upsertStudentProfile, uploadStudentPhoto
} = require('../controllers/profile.controller');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadResume } = require('../config/cloudinary');

const router = express.Router();

router.get('/alumni', getAlumniProfiles);
router.get('/alumni/me', protect, authorize('alumni', 'admin'), getMeAlumniProfile);
router.post('/alumni', protect, authorize('alumni', 'admin'), upload.single('profilePhoto'), upsertAlumniProfile);
router.get('/student/me', protect, authorize('student'), getMeStudentProfile);
router.post('/student', protect, authorize('student'), uploadResume.single('resume'), upsertStudentProfile);
router.post('/student/photo', protect, authorize('student'), upload.single('profilePhoto'), uploadStudentPhoto);
router.get('/student/:userId', protect, getStudentProfile);

module.exports = router;
