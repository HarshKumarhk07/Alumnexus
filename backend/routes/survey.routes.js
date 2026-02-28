const express = require('express');
const router = express.Router();
const { createSurvey, getSurveys, voteSurvey, deleteSurvey } = require('../controllers/survey.controller');
const { protect, authorize, requireVerified } = require('../middleware/auth');

router.get('/', protect, getSurveys);
router.post('/', protect, authorize('admin', 'alumni'), requireVerified, createSurvey);
router.put('/:id/vote', protect, requireVerified, voteSurvey);
router.delete('/:id', protect, authorize('admin', 'alumni'), requireVerified, deleteSurvey);

module.exports = router;
