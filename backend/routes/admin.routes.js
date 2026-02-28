const express = require('express');
const router = express.Router();
const {
    getStats,
    getPendingAlumni,
    verifyAlumni,
    getUsers,
    exportUsers,
    postAnnouncement,
    sendBulkEmail,
    getPublicStats,
    getAllJobs
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Publicly accessible stats for all authenticated users
router.get('/public-stats', getPublicStats);

// Restrict following routes to admin only
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/pending-alumni', getPendingAlumni);
router.put('/verify-alumni/:id', verifyAlumni);
router.get('/users', getUsers);
router.get('/export-users', exportUsers);
router.post('/announcement', postAnnouncement);
router.post('/bulk-email', sendBulkEmail);
router.get('/jobs', getAllJobs);

module.exports = router;
