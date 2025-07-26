const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', auth, userController.updateUserProfile);

// Get profile completion status
router.get('/profile/status', auth, userController.getUserProfileStatus);

// (Optional) Add more endpoints for goals or profile completion if needed
// router.put('/goals', auth, userController.updateUserGoals);
// router.get('/profile/complete', auth, userController.checkProfileComplete);

module.exports = router;