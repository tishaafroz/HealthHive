const Food = require('../models/Food');
const axios = require('axios');

// Spoonacular API configuration
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

// Search foods using Spoonacular API
exports.searchFood = async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Searching for food with Spoonacular:', query);
    
    if (!SPOONACULAR_API_KEY) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    const options = {
      method: 'GET',
      url: `${SPOONACULAR_BASE_URL}/recipes/complexSearch`,
      params: {
        apiKey: SPOONACULAR_API_KEY,
        query: query,
        instructionsRequired: 'true',
        addRecipeInformation: 'true',
        addRecipeNutrition: 'true',
        number: '20',
        offset: '0'
      }
    };

    const response = await axios.request(options);
    
    // Transform Spoonacular data to match our expected format
    const transformedData = {
      parsed: [],
      hints: response.data.results.map(recipe => ({
        food: {
          foodId: recipe.id.toString(),
          label: recipe.title,
          nutrients: {
            ENERC_KCAL: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
            PROCNT: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
            FAT: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0,
            CHOCDF: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0
          },
          category: 'Recipe',
          categoryLabel: 'Recipe',
          image: recipe.image,
          servings: recipe.servings || 1,
          readyInMinutes: recipe.readyInMinutes || 30
        }
      }))
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error searching food with Spoonacular:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error searching food database' });
  }
};

// Get nutrients for a specific food using Spoonacular
exports.getNutrients = async (req, res) => {
  try {
    const { foodId } = req.params;
    
    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    const options = {
      method: 'GET',
      url: `${SPOONACULAR_BASE_URL}/recipes/${foodId}/information`,
      params: {
        includeNutrition: 'true'
      },
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    };

    const response = await axios.request(options);
    
    // Transform nutrition data to match expected format
    const transformedData = {
      ingredients: [{
        parsed: [{
          nutrientsKCal: response.data.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
          weight: 100,
          nutrients: {}
        }]
      }]
    };

    // Map nutrition data
    response.data.nutrition?.nutrients?.forEach(nutrient => {
      const key = nutrient.name.toUpperCase().replace(/\s+/g, '_');
      transformedData.ingredients[0].parsed[0].nutrients[key] = {
        label: nutrient.name,
        quantity: nutrient.amount,
        unit: nutrient.unit
      };
    });

    res.json(transformedData);
  } catch (error) {
    console.error('Error getting nutrients:', error);
    res.status(500).json({ message: 'Error retrieving nutrient information' });
  }
};

// Search recipes by nutrients for meal planning
exports.searchRecipesByNutrients = async (req, res) => {
  try {
    const { 
      minCalories = 0, 
      maxCalories = 800, 
      minProtein = 0, 
      maxProtein = 100,
      minCarbs = 0, 
      maxCarbs = 100, 
      minFat = 0, 
      maxFat = 50,
      number = 10 
    } = req.query;

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    const options = {
      method: 'GET',
      url: `${SPOONACULAR_BASE_URL}/recipes/findByNutrients`,
      params: {
        minCalories: minCalories,
        maxCalories: maxCalories,
        minProtein: minProtein,
        maxProtein: maxProtein,
        minCarbs: minCarbs,
        maxCarbs: maxCarbs,
        minFat: minFat,
        maxFat: maxFat,
        number: number,
        offset: '0'
      },
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('Error searching recipes by nutrients:', error);
    res.status(500).json({ message: 'Error searching recipes by nutrients' });
  }
};

// Search recipes using Spoonacular Recipe API
exports.searchRecipes = async (req, res) => {
  try {
    const { 
      query = '', 
      diet = '', 
      intolerances = '', 
      maxReadyTime = 45, 
      number = 10 
    } = req.query;

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    const options = {
      method: 'GET',
      url: `${SPOONACULAR_BASE_URL}/recipes/complexSearch`,
      params: {
        query: query,
        diet: diet,
        intolerances: intolerances,
        instructionsRequired: 'true',
        addRecipeInformation: 'true',
        addRecipeNutrition: 'true',
        maxReadyTime: maxReadyTime,
        sort: 'popularity',
        offset: '0',
        number: number
      },
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ message: 'Error searching recipes' });
  }
};

// Generate meal plan using Spoonacular
exports.generateMealPlan = async (req, res) => {
  try {
    const { 
      timeFrame = 'day', 
      targetCalories = 2000, 
      diet = '', 
      exclude = '' 
    } = req.body;

    if (!RAPIDAPI_KEY) {
      return res.status(500).json({ message: 'API key not configured' });
    }

    const options = {
      method: 'GET',
      url: `${SPOONACULAR_BASE_URL}/recipes/mealplans/generate`,
      params: {
        timeFrame: timeFrame,
        targetCalories: targetCalories,
        diet: diet,
        exclude: exclude
      },
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ message: 'Error generating meal plan' });
  }
};

// Save food to user's favorites
exports.saveFoodToFavorites = async (req, res) => {
  try {
    const { foodData } = req.body;
    const userId = req.user.id;

    const favorite = new Food({
      userId,
      name: foodData.label,
      edamamId: foodData.foodId,
      nutrients: foodData.nutrients,
      category: foodData.category,
      image: foodData.image
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error saving favorite:', error);
    res.status(500).json({ message: 'Error saving food to favorites' });
  }
};

// Get user's favorite foods
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Food.find({ userId });
    res.json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Error retrieving favorites' });
  }
};

// Add custom food
exports.addCustomFood = async (req, res) => {
  try {
    const { name, nutrients, category } = req.body;
    const userId = req.user.id;

    const customFood = new Food({
      userId,
      name,
      nutrients,
      category,
      isCustom: true
    });

    await customFood.save();
    res.status(201).json(customFood);
  } catch (error) {
    console.error('Error adding custom food:', error);
    res.status(500).json({ message: 'Error adding custom food' });
  }
};

// Update custom food
exports.updateCustomFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nutrients, category } = req.body;
    const userId = req.user.id;

    const updatedFood = await Food.findOneAndUpdate(
      { _id: id, userId, isCustom: true },
      { name, nutrients, category },
      { new: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ message: 'Custom food not found' });
    }

    res.json(updatedFood);
  } catch (error) {
    console.error('Error updating custom food:', error);
    res.status(500).json({ message: 'Error updating custom food' });
  }
};

// Delete custom food
exports.deleteCustomFood = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deletedFood = await Food.findOneAndDelete({ _id: id, userId, isCustom: true });

    if (!deletedFood) {
      return res.status(404).json({ message: 'Custom food not found' });
    }

    res.json({ message: 'Custom food deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom food:', error);
    res.status(500).json({ message: 'Error deleting custom food' });
  }
};
