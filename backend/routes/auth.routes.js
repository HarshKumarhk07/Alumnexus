const express = require('express');
const { register, login, getMe, updateProfile, updatePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../config/cloudinary');

const router = express.Router();

router.post('/register', uploadResume.single('resume'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
