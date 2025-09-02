const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const foodController = require('../controllers/foodController');

// Food search and database routes
router.get('/search', auth, foodController.searchFood);
router.get('/nutrients/:foodId', auth, foodController.getNutrients);
router.get('/recipes/search', auth, foodController.searchRecipes);

// User's personal food management
router.post('/favorites', auth, foodController.saveFoodToFavorites);
router.get('/favorites', auth, foodController.getFavorites);

// Custom food management
router.post('/custom', auth, foodController.addCustomFood);
router.put('/custom/:id', auth, foodController.updateCustomFood);
router.delete('/custom/:id', auth, foodController.deleteCustomFood);

module.exports = router;