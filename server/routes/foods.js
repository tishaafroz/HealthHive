const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const foodController = require('../controllers/foodController');

// Food search and retrieval routes (specific routes first)
router.get('/search', foodController.searchFoods);
router.get('/categories', foodController.getFoodCategories);
router.get('/popular', foodController.getPopularFoods);

// Custom food management routes (require authentication)
router.post('/custom', auth, foodController.addCustomFood);
router.put('/custom/:id', auth, foodController.updateCustomFood);
router.delete('/custom/:id', auth, foodController.deleteCustomFood);

// Generic food route (must be last)
router.get('/:id', foodController.getFoodById);

module.exports = router;