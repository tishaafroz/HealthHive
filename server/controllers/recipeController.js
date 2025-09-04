const axios = require('axios');
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

// Helper function to calculate health score
const calculateHealthScore = (nutritionalInfo, servings = 1) => {
    // Get per-serving values
    const perServing = {
        calories: nutritionalInfo.calories / servings,
        proteins: nutritionalInfo.proteins / servings,
        carbs: nutritionalInfo.carbs / servings,
        fats: nutritionalInfo.fats / servings
    };

    let score = 0;
    const maxScore = 100;
    let scoreBreakdown = {};

    // 1. Calorie Balance (0-20 points)
    const calorieScore = (() => {
        if (perServing.calories >= 300 && perServing.calories <= 700) {
            if (perServing.calories >= 400 && perServing.calories <= 600) return 20;
            return 15;
        }
        if (perServing.calories >= 200 && perServing.calories <= 800) return 10;
        return 0;
    })();
    score += calorieScore;
    scoreBreakdown.calories = calorieScore;

    // 2. Macronutrient Balance (0-40 points)
    const totalCalories = perServing.calories;
    
    // Protein (0-15 points)
    const proteinCalories = perServing.proteins * 4;
    const proteinPercentage = (proteinCalories / totalCalories) * 100;
    const proteinScore = (() => {
        if (proteinPercentage >= 20 && proteinPercentage <= 30) return 15;
        if (proteinPercentage >= 15 && proteinPercentage <= 35) return 10;
        if (proteinPercentage >= 10 && proteinPercentage <= 40) return 5;
        return 0;
    })();
    score += proteinScore;
    scoreBreakdown.protein = proteinScore;

    // Carbs (0-15 points)
    const carbCalories = perServing.carbs * 4;
    const carbPercentage = (carbCalories / totalCalories) * 100;
    const carbScore = (() => {
        if (carbPercentage >= 45 && carbPercentage <= 65) return 15;
        if (carbPercentage >= 40 && carbPercentage <= 70) return 10;
        if (carbPercentage >= 35 && carbPercentage <= 75) return 5;
        return 0;
    })();
    score += carbScore;
    scoreBreakdown.carbs = carbScore;

    // Fats (0-10 points)
    const fatCalories = perServing.fats * 9;
    const fatPercentage = (fatCalories / totalCalories) * 100;
    const fatScore = (() => {
        if (fatPercentage >= 20 && fatPercentage <= 35) return 10;
        if (fatPercentage >= 15 && fatPercentage <= 40) return 7;
        if (fatPercentage >= 10 && fatPercentage <= 45) return 3;
        return 0;
    })();
    score += fatScore;
    scoreBreakdown.fats = fatScore;

    // 3. Nutrient Density Score (0-40 points)
    const nutrientDensityScore = (() => {
        let densityScore = 0;
        
        // Protein density (0-15 points)
        const proteinGramsPer100Cal = (perServing.proteins / perServing.calories) * 100;
        if (proteinGramsPer100Cal >= 7) densityScore += 15;
        else if (proteinGramsPer100Cal >= 5) densityScore += 10;
        else if (proteinGramsPer100Cal >= 3) densityScore += 5;

        // Calorie efficiency (0-15 points)
        const caloriesPerGramProtein = perServing.calories / perServing.proteins;
        if (caloriesPerGramProtein <= 15) densityScore += 15;
        else if (caloriesPerGramProtein <= 20) densityScore += 10;
        else if (caloriesPerGramProtein <= 25) densityScore += 5;

        // Balance ratio (0-10 points)
        const macroRatio = proteinPercentage / fatPercentage;
        if (macroRatio >= 0.8 && macroRatio <= 1.2) densityScore += 10;
        else if (macroRatio >= 0.6 && macroRatio <= 1.4) densityScore += 5;

        return densityScore;
    })();
    score += nutrientDensityScore;
    scoreBreakdown.nutrientDensity = nutrientDensityScore;

    // Normalize final score to 0-100
    const finalScore = Math.min(Math.max(Math.round(score), 0), maxScore);

    return {
        score: finalScore,
        breakdown: scoreBreakdown,
        details: {
            caloriesPerServing: Math.round(perServing.calories),
            proteinPercentage: Math.round(proteinPercentage),
            carbPercentage: Math.round(carbPercentage),
            fatPercentage: Math.round(fatPercentage)
        }
    };
};

// Search recipes using Spoonacular API
const searchRecipes = async (req, res) => {
    const { keyword, tags, sort, number } = req.query;
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const apiUrl = 'https://api.spoonacular.com/recipes/complexSearch';

    try {
        const response = await axios.get(apiUrl, {
            params: {
                apiKey,
                query: keyword || '',
                tags: tags || '',
                sort: sort || 'popularity',
                number: number || 10,
                addRecipeInformation: true,
                fillIngredients: true
            }
        });

        // Transform the response to include only the data we need
        const recipes = response.data.results.map(recipe => ({
            id: recipe.id,
            title: recipe.title,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            image: recipe.image,
            healthScore: recipe.healthScore,
            aggregateLikes: recipe.aggregateLikes,
            ingredients: recipe.extendedIngredients?.map(ing => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit
            }))
        }));

        res.status(200).json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ 
            message: 'Error fetching recipes', 
            error: error.message 
        });
    }
};

// Get recipe information from Spoonacular API
const getRecipeInformation = async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const apiUrl = `https://api.spoonacular.com/recipes/${id}/information`;

    try {
        const response = await axios.get(apiUrl, { 
            params: { 
                apiKey,
                includeNutrition: true 
            }
        });

        console.log('API Response:', response.data);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching recipe information:', error);
        res.status(500).json({ 
            message: 'Error fetching recipe information', 
            error: error.message 
        });
    }
};

// Get detailed recipe information
const getRecipeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        console.log('Fetching recipe with id:', id, 'for user:', userId);

        // Check if id is a MongoDB ObjectId (24 characters hex string)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

        let recipe;
        if (isMongoId) {
            // Fetch from local database
            recipe = await Recipe.findOne({ _id: id, userId });
        } else {
            // Fetch from Spoonacular API
            const apiKey = process.env.SPOONACULAR_API_KEY;
            const response = await axios.get(
                `https://api.spoonacular.com/recipes/${id}/information`,
                { 
                    params: { 
                        apiKey,
                        includeNutrition: true 
                    }
                }
            );

            // Transform Spoonacular data to match our recipe format
            recipe = {
                name: response.data.title,
                cuisine: response.data.cuisines?.[0] || 'Various',
                ingredients: response.data.extendedIngredients?.map(ing => ({
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit
                })) || [],
                instructions: response.data.analyzedInstructions?.[0]?.steps?.map(step => ({
                    stepNumber: step.number,
                    description: step.step,
                    timerDuration: step.length?.number
                })) || [],
                category: response.data.dishTypes?.[0] || 'Main Course',
                preparationTime: response.data.readyInMinutes,
                complexity: response.data.preparationMinutes > 45 ? 'Hard' : 
                           response.data.preparationMinutes > 25 ? 'Medium' : 'Easy',
                nutritionalInfo: {
                    servingSize: response.data.servings,
                    calories: response.data.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                    proteins: response.data.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                    carbs: response.data.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                    fats: response.data.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0
                },
                image: response.data.image,
                healthScore: response.data.healthScore,
                isFavorite: false // Default for external recipes
            };
        }

        if (!recipe) {
            console.log('Recipe not found:', { id, userId });
            return res.status(404).json({ message: 'Recipe not found' });
        }

        console.log('Found recipe:', recipe);
        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        res.status(500).json({ 
            message: 'Error fetching recipe details', 
            error: error.message 
        });
    }
};

// Toggle favorite status
const toggleFavorite = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.userId;

        // Check if recipe already exists in our database
        let recipe = await Recipe.findOne({ 
            originalId: recipeId,  // For Spoonacular recipes
            userId 
        });

        if (!recipe) {
            // If not found by originalId, try finding by _id (for local recipes)
            recipe = await Recipe.findOne({ 
                _id: recipeId,
                userId 
            });

            // If still not found and it's a Spoonacular ID, fetch and save the recipe
            if (!recipe && !mongoose.Types.ObjectId.isValid(recipeId)) {
                // Fetch recipe data from Spoonacular
                const apiKey = process.env.SPOONACULAR_API_KEY;
                const response = await axios.get(
                    `https://api.spoonacular.com/recipes/${recipeId}/information`,
                    { 
                        params: { 
                            apiKey,
                            includeNutrition: true 
                        }
                    }
                );

                // Create new recipe document
                recipe = new Recipe({
                    userId,
                    originalId: recipeId, // Store Spoonacular ID
                    name: response.data.title,
                    cuisine: response.data.cuisines?.[0] || 'Various',
                    ingredients: response.data.extendedIngredients?.map(ing => ({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit
                    })) || [],
                    instructions: response.data.analyzedInstructions?.[0]?.steps?.map(step => ({
                        stepNumber: step.number,
                        description: step.step,
                        timerDuration: step.length?.number
                    })) || [],
                    category: response.data.dishTypes?.[0] || 'Main Course',
                    preparationTime: response.data.readyInMinutes,
                    complexity: response.data.preparationMinutes > 45 ? 'Hard' : 
                               response.data.preparationMinutes > 25 ? 'Medium' : 'Easy',
                    nutritionalInfo: {
                        servingSize: response.data.servings,
                        calories: response.data.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0,
                        proteins: response.data.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0,
                        carbs: response.data.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0,
                        fats: response.data.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0
                    },
                    image: response.data.image,
                    healthScore: response.data.healthScore,
                    isFavorite: true // Set to true since we're favoriting it
                });
            }
        }

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Toggle favorite status
        recipe.isFavorite = !recipe.isFavorite;
        await recipe.save();

        res.status(200).json({ 
            message: `Recipe ${recipe.isFavorite ? 'added to' : 'removed from'} favorites`,
            isFavorite: recipe.isFavorite 
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ 
            message: 'Error updating favorite status', 
            error: error.message 
        });
    }
};

// Get favorite recipes
const getFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;
        const favorites = await Recipe.find({ 
            userId, 
            isFavorite: true 
        });

        res.status(200).json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ 
            message: 'Error fetching favorite recipes', 
            error: error.message 
        });
    }
};

// Update recipe instructions
const updateInstructions = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { instructions } = req.body;
        const userId = req.user.userId;

        const recipe = await Recipe.findOne({ _id: recipeId, userId });
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        recipe.instructions = instructions;
        await recipe.save();

        res.status(200).json(recipe);
    } catch (error) {
        console.error('Error updating instructions:', error);
        res.status(500).json({ 
            message: 'Error updating recipe instructions', 
            error: error.message 
        });
    }
};

// Save recipe
const saveRecipe = async (req, res) => {
    try {
        const { recipe } = req.body;
        const userId = req.user.userId;

        // Clean up ingredients data
        const cleanedIngredients = recipe.ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit || 'piece'
        }));

        // Calculate health score with detailed breakdown
        const healthScoreData = calculateHealthScore(
            recipe.nutritionalInfo,
            recipe.nutritionalInfo.servingSize
        );

        const recipeData = {
            ...recipe,
            userId,
            ingredients: cleanedIngredients,
            image: recipe.image || null,
            healthScore: healthScoreData.score,
            healthScoreDetails: {
                breakdown: healthScoreData.breakdown,
                nutritionDetails: healthScoreData.details
            }
        };

        // Check if recipe already exists for this user
        let existingRecipe = await Recipe.findOne({
            name: recipe.name,
            userId
        });

        if (existingRecipe) {
            Object.assign(existingRecipe, recipeData);
            await existingRecipe.save();
            res.status(200).json(existingRecipe);
        } else {
            const newRecipe = new Recipe(recipeData);
            await newRecipe.save();
            res.status(201).json(newRecipe);
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ 
            message: 'Error saving recipe', 
            error: error.message,
            details: error.errors
        });
    }
};

module.exports = {
    searchRecipes,
    getRecipeDetails,
    getRecipeInformation,
    toggleFavorite,
    getFavorites,
    updateInstructions,
    saveRecipe
};
