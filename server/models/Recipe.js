const mongoose = require('mongoose');

const instructionStepSchema = new mongoose.Schema({
    stepNumber: { type: Number, required: true },
    description: { type: String, required: true },
    timerDuration: { type: Number }, // Duration in minutes
    videoUrl: { type: String }
});

const nutritionSchema = new mongoose.Schema({
    servingSize: { type: Number, required: true },
    calories: { type: Number, required: true },
    proteins: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true }
});

const healthScoreDetailsSchema = new mongoose.Schema({
    breakdown: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
        nutrientDensity: Number
    },
    nutritionDetails: {
        caloriesPerServing: Number,
        proteinPercentage: Number,
        carbPercentage: Number,
        fatPercentage: Number
    }
});

const recipeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalId: { type: String }, // For storing Spoonacular recipe IDs
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    ingredients: [{ 
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        unit: { type: String, required: true }
    }],
    instructions: [instructionStepSchema],
    category: { type: String, required: true },
    popularity: { type: Number, default: 0 },
    preparationTime: { type: Number, required: true },
    complexity: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    nutritionalInfo: nutritionSchema,
    videoUrl: { type: String },
    isFavorite: { type: Boolean, default: false },
    tags: [String],
    image: { 
        type: String,
        default: null
    },
    healthScore: {
        type: Number,
        default: 0
    },
    healthScoreDetails: {
        type: healthScoreDetailsSchema,
        default: null
    }
}, {
    timestamps: true
});

// Add compound index for better query performance
recipeSchema.index({ userId: 1, originalId: 1 });
recipeSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
