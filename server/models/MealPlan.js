const mongoose = require('mongoose');

const MealItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.1
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp']
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  timeSlot: {
    type: String,
    default: ''
  }
});

const DailyMealPlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  meals: [MealItemSchema],
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  targetNutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fat: { type: Number, required: true }
  },
  nutritionProgress: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  }
});

const MealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  dailyPlans: [DailyMealPlanSchema],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_building', 'general_health']
  },
  preferences: {
    dietaryRestrictions: [String],
    calorieTarget: Number,
    macroRatios: {
      protein: Number,
      carbohydrates: Number,
      fat: Number
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
MealPlanSchema.index({ userId: 1, startDate: -1 });
MealPlanSchema.index({ isTemplate: 1, templateCategory: 1 });

module.exports = mongoose.model('MealPlan', MealPlanSchema); 