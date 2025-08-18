const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mealController = require('../controllers/mealController');

// Meal planning routes
router.post('/plan/generate', auth, mealController.generateMealPlan);
router.get('/plan/current', auth, mealController.getCurrentMealPlan);
router.get('/templates', mealController.getMealTemplates);
router.get('/nutrition/targets/:userId', auth, mealController.getNutritionTargets);

module.exports = router; 