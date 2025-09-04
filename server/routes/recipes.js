const express = require('express');
const { 
    searchRecipes, 
    getRecipeDetails,
    getRecipeInformation,
    toggleFavorite,
    getFavorites,
    updateInstructions,
    saveRecipe
} = require('../controllers/recipeController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', searchRecipes);
router.get('/:id/information', getRecipeInformation);

// Protected routes
router.get('/:id', auth, getRecipeDetails);
router.post('/:recipeId/favorite', auth, toggleFavorite);
router.get('/user/favorites', auth, getFavorites);
router.put('/:recipeId/instructions', auth, updateInstructions);
router.post('/save', auth, saveRecipe);

module.exports = router;
