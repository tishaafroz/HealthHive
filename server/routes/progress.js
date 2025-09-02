const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const progressController = require('../controllers/progressController');

// Progress entry routes
router.post('/entry', auth, progressController.addProgressEntry);
router.get('/entries', auth, progressController.getProgressHistory);
router.put('/entry/:id', auth, progressController.updateProgressEntry);
router.delete('/entry/:id', auth, progressController.deleteProgressEntry);

// Analytics routes
router.get('/analytics/dashboard', auth, progressController.getDashboardAnalytics);
router.get('/analytics/weight-trend', auth, progressController.getWeightTrend);
router.get('/analytics/activity-summary', auth, progressController.getActivitySummary);
router.get('/analytics/goal-progress', auth, progressController.getGoalProgress);
router.get('/analytics/compare/:period1/:period2', auth, progressController.comparePeriods);

module.exports = router;
