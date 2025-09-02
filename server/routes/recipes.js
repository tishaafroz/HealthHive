const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RecipeController = require('../controllers/recipeController');

// Create a new recipe
router.post('/', auth, async (req, res) => {
  await RecipeController.createRecipe(req, res);
});

// Get personalized recipe recommendations
router.get('/recommendations', auth, async (req, res) => {
  await RecipeController.getRecommendations(req, res);
});

// Search recipes with filters
router.get('/search', async (req, res) => {
  await RecipeController.searchRecipes(req, res);
});

// Track recipe interaction
router.post('/:recipeId/interaction', auth, async (req, res) => {
  await RecipeController.trackInteraction(req, res);
});

module.exports = router;
