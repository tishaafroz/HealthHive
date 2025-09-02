const Recipe = require('../models/Recipe');
const UserRecipeInteraction = require('../models/UserRecipeInteraction');
const User = require('../models/User');
const NutritionTargets = require('../models/NutritionTargets');

class RecipeController {
  // Create a new recipe
  static async createRecipe(req, res) {
    try {
      const recipeData = { ...req.body, createdBy: req.user.id };
      
      // Calculate total time if not provided
      if (!recipeData.totalTime) {
        recipeData.totalTime = (recipeData.prepTime || 0) + (recipeData.cookTime || 0);
      }
      
      // Validate nutrition data
      if (!recipeData.nutrition || !recipeData.nutrition.caloriesPerServing) {
        // Calculate nutrition from ingredients if not provided
        recipeData.nutrition = calculateNutritionFromIngredients(recipeData.ingredients, recipeData.servings);
      }
      
      const recipe = new Recipe(recipeData);
      await recipe.save();
      
      res.status(201).json({
        success: true,
        data: recipe
      });
      
    } catch (error) {
      console.error('Create recipe error:', error);
      res.status(500).json({
        message: 'Server error while creating recipe'
      });
    }
  }
  
  // Get personalized recipe recommendations
  static async getRecommendations(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const nutritionTargets = await NutritionTargets.findOne({ userId });
      
      if (!user || !nutritionTargets) {
        return res.status(404).json({
          message: 'User profile or nutrition targets not found'
        });
      }
      
      const recommendations = await generatePersonalizedRecommendations(user, nutritionTargets);
      
      res.json({
        success: true,
        data: recommendations
      });
      
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({
        message: 'Server error while getting recommendations'
      });
    }
  }
  
  // Search recipes with advanced filters
  static async searchRecipes(req, res) {
    try {
      const {
        query,
        mealType,
        difficulty,
        maxPrepTime,
        dietaryTags,
        healthBenefits,
        calorieRange,
        sort = 'rating'
      } = req.query;
      
      const filter = {};
      
      // Text search if query provided
      if (query) {
        filter.$text = { $search: query };
      }
      
      // Apply filters
      if (mealType) filter.mealType = mealType;
      if (difficulty) filter.difficulty = difficulty;
      if (maxPrepTime) filter.prepTime = { $lte: parseInt(maxPrepTime) };
      if (dietaryTags) filter.dietaryTags = { $all: Array.isArray(dietaryTags) ? dietaryTags : [dietaryTags] };
      if (healthBenefits) filter.healthBenefits = { $all: Array.isArray(healthBenefits) ? healthBenefits : [healthBenefits] };
      if (calorieRange) {
        const [min, max] = calorieRange.split('-').map(Number);
        filter['nutrition.caloriesPerServing'] = { $gte: min, $lte: max };
      }
      
      // Sorting
      const sortOptions = {
        rating: { 'ratings.average': -1 },
        popularity: { popularityScore: -1 },
        newest: { createdAt: -1 }
      };
      
      const recipes = await Recipe.find(filter)
        .sort(sortOptions[sort] || sortOptions.rating)
        .limit(20);
      
      res.json({
        success: true,
        data: recipes
      });
      
    } catch (error) {
      console.error('Search recipes error:', error);
      res.status(500).json({
        message: 'Server error while searching recipes'
      });
    }
  }
  
  // Track recipe interaction
  static async trackInteraction(req, res) {
    try {
      const { recipeId } = req.params;
      const { action, data } = req.body;
      const userId = req.user.id;
      
      let interaction = await UserRecipeInteraction.findOne({
        userId,
        recipeId
      });
      
      if (!interaction) {
        interaction = new UserRecipeInteraction({
          userId,
          recipeId
        });
      }
      
      // Update interaction based on action type
      switch (action) {
        case 'view':
          interaction.actions.viewed = new Date();
          break;
          
        case 'save':
          interaction.actions.saved = new Date();
          break;
          
        case 'cook':
          interaction.actions.cooked = new Date();
          interaction.timesCooked += 1;
          if (data.cookingTime) {
            interaction.averageCookingTime = 
              (interaction.averageCookingTime || 0) * (interaction.timesCooked - 1) / interaction.timesCooked +
              data.cookingTime / interaction.timesCooked;
          }
          break;
          
        case 'rate':
          interaction.actions.rated = {
            rating: data.rating,
            date: new Date()
          };
          interaction.personalRating = data.rating;
          
          // Update recipe's overall rating
          await updateRecipeRating(recipeId, data.rating);
          break;
          
        case 'review':
          interaction.actions.reviewed = {
            comment: data.comment,
            date: new Date()
          };
          break;
          
        case 'modify':
          interaction.actions.modified.push({
            modification: data.modification,
            date: new Date()
          });
          break;
          
        default:
          return res.status(400).json({
            message: 'Invalid action type'
          });
      }
      
      await interaction.save();
      
      res.json({
        success: true,
        data: interaction
      });
      
    } catch (error) {
      console.error('Track interaction error:', error);
      res.status(500).json({
        message: 'Server error while tracking interaction'
      });
    }
  }
}

// Helper function to calculate nutrition from ingredients
function calculateNutritionFromIngredients(ingredients, servings) {
  const totalNutrition = ingredients.reduce((acc, ingredient) => {
    return {
      calories: acc.calories + (ingredient.calories || 0),
      protein: acc.protein + (ingredient.protein || 0),
      carbs: acc.carbs + (ingredient.carbs || 0),
      fat: acc.fat + (ingredient.fat || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return {
    caloriesPerServing: Math.round(totalNutrition.calories / servings),
    proteinPerServing: Math.round(totalNutrition.protein / servings),
    carbsPerServing: Math.round(totalNutrition.carbs / servings),
    fatPerServing: Math.round(totalNutrition.fat / servings)
  };
}

// Helper function to update recipe rating
async function updateRecipeRating(recipeId, newRating) {
  const recipe = await Recipe.findById(recipeId);
  
  if (!recipe) return;
  
  const oldCount = recipe.ratings.count;
  const newCount = oldCount + 1;
  
  // Update rating distribution
  recipe.ratings.distribution[`${Math.floor(newRating)}`]++;
  
  // Update average rating
  recipe.ratings.average = 
    (recipe.ratings.average * oldCount + newRating) / newCount;
  
  recipe.ratings.count = newCount;
  
  await recipe.save();
}

// Helper function to generate personalized recommendations
async function generatePersonalizedRecommendations(user, nutritionTargets) {
  const dietaryTags = user.dietaryPreferences;
  const healthBenefits = [];
  
  // Add health benefits based on user goals
  if (user.healthGoal === 'lose_weight') {
    healthBenefits.push('weight-loss');
  } else if (user.healthGoal === 'gain_weight') {
    healthBenefits.push('muscle-building');
  }
  
  // Calculate ideal calorie range
  const targetCalories = nutritionTargets.dailyCalories / 3; // Assuming 3 main meals
  const calorieRange = {
    min: targetCalories * 0.8,
    max: targetCalories * 1.2
  };
  
  // Get user's recent interactions
  const recentInteractions = await UserRecipeInteraction.find({
    userId: user._id,
    'actions.cooked': { $exists: true }
  })
  .sort({ 'actions.cooked': -1 })
  .limit(10)
  .populate('recipeId');
  
  // Extract preferences from interactions
  const preferredTags = extractPreferences(recentInteractions);
  
  // Find matching recipes
  const recommendations = await Recipe.find({
    'nutrition.caloriesPerServing': {
      $gte: calorieRange.min,
      $lte: calorieRange.max
    },
    dietaryTags: { $in: dietaryTags },
    healthBenefits: { $in: healthBenefits },
    isVerified: true,
    _id: { $nin: recentInteractions.map(i => i.recipeId._id) }
  })
  .sort({
    'ratings.average': -1,
    popularityScore: -1
  })
  .limit(10);
  
  return recommendations;
}

// Helper function to extract preferences from interactions
function extractPreferences(interactions) {
  const tagCounts = {};
  
  interactions.forEach(interaction => {
    if (!interaction.recipeId) return;
    
    const recipe = interaction.recipeId;
    const weight = interaction.personalRating || 3;
    
    recipe.dietaryTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + weight;
    });
    
    recipe.healthBenefits.forEach(benefit => {
      tagCounts[benefit] = (tagCounts[benefit] || 0) + weight;
    });
  });
  
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([tag]) => tag)
    .slice(0, 5);
}

module.exports = RecipeController;
