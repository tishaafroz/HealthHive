const mongoose = require('mongoose');

const NutritionTargetsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Basic Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE)
  bmr: {
    type: Number,
    required: true
  },
  tdee: {
    type: Number,
    required: true
  },
  
  // Daily Calorie Target
  dailyCalories: {
    type: Number,
    required: true
  },
  
  // Macro Targets (in grams)
  macros: {
    protein: {
      grams: { type: Number, required: true },
      percentage: { type: Number, required: true },
      calories: { type: Number, required: true }
    },
    carbohydrates: {
      grams: { type: Number, required: true },
      percentage: { type: Number, required: true },
      calories: { type: Number, required: true }
    },
    fat: {
      grams: { type: Number, required: true },
      percentage: { type: Number, required: true },
      calories: { type: Number, required: true }
    }
  },
  
  // Micro Targets (optional)
  micros: {
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 }
  },
  
  // Meal Distribution
  mealDistribution: {
    breakfast: { type: Number, default: 20 }, // percentage
    lunch: { type: Number, default: 30 },
    dinner: { type: Number, default: 35 },
    snacks: { type: Number, default: 15 }
  },
  
  // Calculation Parameters
  calculationParams: {
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    activityLevel: { type: String, required: true },
    healthGoal: { type: String, required: true },
    goalAdjustment: { type: Number, default: 0 } // +500 for weight gain, -500 for weight loss
  },
  
  // Target Updates
  lastUpdated: { type: Date, default: Date.now },
  nextUpdate: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
NutritionTargetsSchema.index({ userId: 1 });

module.exports = mongoose.model('NutritionTargets', NutritionTargetsSchema); 