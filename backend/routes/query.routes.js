const express = require('express');
const router = express.Router();
const {
    getQueries,
    getQuery,
    createQuery,
    replyToQuery,
    resolveQuery,
    deleteQuery,
    deleteReply
} = require('../controllers/query.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');

router.get('/', protect, getQueries);
router.get('/:id', protect, getQuery);
router.post('/', protect, authorize('student'), createQuery);
router.post('/:id/reply', protect, authorize('alumni', 'admin'), requireVerified, replyToQuery);
router.put('/:id/resolve', protect, resolveQuery);
router.delete('/:id/reply/:replyId', protect, deleteReply);
router.delete('/:id', protect, authorize('admin'), deleteQuery);

module.exports = router;
