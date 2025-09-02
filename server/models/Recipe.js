const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  prepTime: {
    type: Number,
    required: true,
    min: 0
  },
  cookTime: {
    type: Number,
    required: true,
    min: 0
  },
  totalTime: {
    type: Number,
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard']
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    alternatives: [String],
    isOptional: {
      type: Boolean,
      default: false
    }
  }],
  
  instructions: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true
    },
    estimatedTime: Number,
    tips: String,
    imageUrl: String
  }],
  
  nutrition: {
    caloriesPerServing: {
      type: Number,
      required: true
    },
    proteinPerServing: {
      type: Number,
      required: true
    },
    carbsPerServing: {
      type: Number,
      required: true
    },
    fatPerServing: {
      type: Number,
      required: true
    },
    fiberPerServing: Number,
    sugarPerServing: Number,
    sodiumPerServing: Number,
    vitamins: {
      vitaminA: Number,
      vitaminC: Number,
      vitaminD: Number,
      iron: Number,
      calcium: Number
    }
  },
  
  dietaryTags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'low-fat', 'high-protein']
  }],
  
  mealType: [{
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  }],
  
  healthBenefits: [{
    type: String,
    enum: ['weight-loss', 'muscle-building', 'heart-healthy', 'diabetic-friendly', 'immune-boosting', 'energy-boosting']
  }],
  
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },
  
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    helpfulVotes: {
      type: Number,
      default: 0
    },
    photos: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  images: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['hero', 'step', 'final', 'ingredient'],
      required: true
    },
    alt: String
  }],
  
  videoUrl: String,
  sourceUrl: String,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  popularityScore: {
    type: Number,
    default: 0
  },
  
  successRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  averageCookingTime: {
    type: Number,
    min: 0
  },
  
  commonModifications: [String],
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
RecipeSchema.index({ name: 'text', description: 'text' });
RecipeSchema.index({ 'nutrition.caloriesPerServing': 1 });
RecipeSchema.index({ dietaryTags: 1 });
RecipeSchema.index({ mealType: 1 });
RecipeSchema.index({ difficulty: 1 });
RecipeSchema.index({ 'ratings.average': -1 });
RecipeSchema.index({ popularityScore: -1 });
RecipeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Recipe', RecipeSchema);
