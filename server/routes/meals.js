const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mealController = require('../controllers/mealController');
const mealScheduleController = require('../controllers/mealScheduleController');

// Meal planning routes
router.post('/plan/generate', auth, mealController.generateMealPlan);
router.get('/plan/current', auth, mealController.getCurrentMealPlan);
router.get('/templates', mealController.getMealTemplates);
router.get('/nutrition/targets/:userId', auth, mealController.getNutritionTargets);

// Meal scheduling routes
router.post('/schedule', auth, mealScheduleController.createSchedule);
router.get('/schedule/:date', auth, mealScheduleController.getMealsByDate);
router.put('/schedule/:id', auth, mealScheduleController.updateSchedule);
router.delete('/schedule/:id', auth, mealScheduleController.deleteSchedule);
router.post('/schedule/:id/complete', auth, mealScheduleController.completeMeal);
router.get('/schedule/:mealId/alternatives', auth, mealScheduleController.suggestAlternatives);

module.exports = router;