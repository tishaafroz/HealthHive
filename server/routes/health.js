const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const healthController = require('../controllers/healthController');

// BMI and Health Assessment routes
router.post('/bmi/calculate', auth, healthController.calculateBMI);
router.get('/bmi/history', auth, healthController.getBMIHistory);
router.get('/recommendations', auth, healthController.getHealthRecommendations);
router.put('/bmi/update/:id', auth, healthController.updateBMI);
router.delete('/bmi/:id', auth, healthController.deleteBMI);

module.exports = router;
