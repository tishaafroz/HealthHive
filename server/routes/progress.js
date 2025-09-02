const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProgressController = require('../controllers/progressController');

// Progress entry routes
router.post('/entry', auth, (req, res) => ProgressController.addProgressEntry(req, res));
router.get('/entries', auth, (req, res) => ProgressController.getProgressHistory(req, res));
router.put('/entry/:id', auth, (req, res) => ProgressController.updateProgressEntry(req, res));
router.delete('/entry/:id', auth, (req, res) => ProgressController.deleteProgressEntry(req, res));

// Analytics routes
router.get('/weight-trend', auth, (req, res) => ProgressController.getWeightTrend(req, res));
router.get('/calorie-balance', auth, (req, res) => ProgressController.getCalorieBalance(req, res));
router.get('/workout-metrics', auth, (req, res) => ProgressController.getWorkoutMetrics(req, res));
router.get('/meal-compliance', auth, (req, res) => ProgressController.getMealCompliance(req, res));
router.get('/goal-progress', auth, (req, res) => ProgressController.getGoalProgress(req, res));

module.exports = router;
