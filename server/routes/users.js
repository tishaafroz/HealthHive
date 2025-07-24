const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', auth, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', auth, updateUserProfile);

module.exports = router;