const Food = require('../models/Food');
const axios = require('axios');

// Edamam API configuration
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_BASE_URL = 'https://api.edamam.com/api/food-database/v2';

// Search foods from Edamam API
exports.searchFood = async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`${EDAMAM_BASE_URL}/parser`, {
      params: {
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
        ingr: query
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error searching food:', error);
    res.status(500).json({ message: 'Error searching food database' });
  }
};

// Get nutrients for a specific food
exports.getNutrients = async (req, res) => {
  try {
    const { foodId } = req.params;
    const response = await axios.get(`${EDAMAM_BASE_URL}/nutrients`, {
      params: {
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
        ingredients: [{ foodId }]
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error getting nutrients:', error);
    res.status(500).json({ message: 'Error retrieving nutrient information' });
  }
};

// Search recipes using Edamam Recipe API
exports.searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`https://api.edamam.com/search`, {
      params: {
        app_id: process.env.EDAMAM_RECIPE_APP_ID,
        app_key: process.env.EDAMAM_RECIPE_APP_KEY,
        q: query
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ message: 'Error searching recipes' });
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
