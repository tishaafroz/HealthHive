const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  brand: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: [
      'fruits', 'vegetables', 'grains', 'proteins', 'dairy', 
      'nuts_seeds', 'oils_fats', 'beverages', 'snacks', 'condiments'
    ]
  },
  subcategory: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  
  // Nutritional Information (per 100g)
  nutrition: {
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbohydrates: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    fiber: { type: Number, default: 0, min: 0 },
    sugar: { type: Number, default: 0, min: 0 },
    sodium: { type: Number, default: 0, min: 0 },
    cholesterol: { type: Number, default: 0, min: 0 }
  },
  
  // Serving Information
  servingSize: {
    amount: { type: Number, required: true },
    unit: { type: String, required: true, enum: ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp'] },
    weightInGrams: { type: Number, required: true }
  },
  
  // Additional Nutrients (optional)
  vitamins: {
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    vitaminD: { type: Number, default: 0 },
    vitaminE: { type: Number, default: 0 },
    vitaminK: { type: Number, default: 0 },
    vitaminB12: { type: Number, default: 0 }
  },
  minerals: {
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 }
  },
  
  // Allergen Information
  allergens: [{
    type: String,
    enum: ['dairy', 'eggs', 'fish', 'shellfish', 'tree_nuts', 'peanuts', 'wheat', 'soy']
  }],
  
  // Source and Verification
  isCustom: { type: Boolean, default: false },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dataSource: { type: String, default: 'USDA' },
  verified: { type: Boolean, default: true },
  
  // Recipe/API specific fields
  spoonacularId: { type: Number, default: null },
  fallbackId: { type: String, default: null },
  isRecipe: { type: Boolean, default: false },
  
  // Popularity and Search
  searchCount: { type: Number, default: 0 },
  isPopular: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Text index for search functionality
FoodSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Compound indexes for efficient filtering
FoodSchema.index({ category: 1, 'nutrition.calories': 1 });
FoodSchema.index({ isCustom: 1, addedBy: 1 });

module.exports = mongoose.model('Food', FoodSchema); 