const express = require('express');
const router = express.Router();
const {
    getStats,
    getPendingAlumni,
    verifyAlumni,
    getUsers,
    exportUsers,
    exportStudents,
    postAnnouncement,
    sendBulkEmail,
    getPublicStats,
    getAllJobs,
    deleteUser,
    updateUserStatus
} = require('../controllers/admin.controller');
const { getSpotlight, updateSpotlight } = require('../controllers/spotlight.controller');
const { upload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

// Publicly accessible stats for all visitors (including unauthenticated landing page)
router.get('/public-stats', getPublicStats);
router.get('/spotlight', getSpotlight);

// Protect all following routes
router.use(protect);

// Restrict following routes to admin only
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/pending-alumni', getPendingAlumni);
router.put('/verify-alumni/:id', verifyAlumni);
router.get('/users', getUsers);
router.get('/export-users', exportUsers);
router.get('/export-students', exportStudents);
router.post('/announcement', postAnnouncement);
router.post('/bulk-email', sendBulkEmail);
router.get('/jobs', getAllJobs);
router.delete('/users/:id', deleteUser);
router.put('/users/status/:id', updateUserStatus);
router.post('/spotlight', upload.single('image'), updateSpotlight);

module.exports = router;
