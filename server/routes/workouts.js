const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const workoutController = require('../controllers/workoutController');

// Exercise routes
router.get('/exercises', auth, workoutController.getExercises);
router.get('/exercises/search', auth, workoutController.searchExercises);

// Workout plan routes
router.post('/plans', auth, workoutController.createWorkoutPlan);
router.get('/plans', auth, workoutController.getUserWorkoutPlans);
router.put('/plans/:id', auth, workoutController.updateWorkoutPlan);
router.delete('/plans/:id', auth, workoutController.deleteWorkoutPlan);
router.post('/plans/generate', auth, workoutController.generateWorkoutPlan);

// Workout session routes
router.post('/sessions/:sessionId/start', auth, workoutController.startWorkoutSession);
router.put('/sessions/:sessionId/progress', auth, workoutController.updateWorkoutProgress);
router.post('/sessions/:sessionId/complete', auth, workoutController.completeWorkoutSession);
router.get('/sessions/history', auth, workoutController.getWorkoutHistory);

module.exports = router;
