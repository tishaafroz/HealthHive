const mongoose = require('mongoose');

const UserRecipeInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  
  actions: {
    viewed: {
      type: Date
    },
    saved: {
      type: Date
    },
    cooked: {
      type: Date
    },
    rated: {
      rating: Number,
      date: Date
    },
    reviewed: {
      comment: String,
      date: Date
    },
    modified: [{
      modification: String,
      date: Date
    }]
  },
  
  cookingNotes: String,
  
  personalRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  timesCooked: {
    type: Number,
    default: 0
  },
  
  averageCookingTime: Number,
  
  lastCookedDate: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient user-recipe queries
UserRecipeInteractionSchema.index({ userId: 1, recipeId: 1 }, { unique: true });
UserRecipeInteractionSchema.index({ userId: 1, 'actions.cooked': -1 });
UserRecipeInteractionSchema.index({ userId: 1, personalRating: -1 });

module.exports = mongoose.model('UserRecipeInteraction', UserRecipeInteractionSchema);
