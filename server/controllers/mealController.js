const MealPlan = require('../models/MealPlan');
const NutritionTargets = require('../models/NutritionTargets');
const Food = require('../models/Food');
const User = require('../models/User');
const axios = require('axios');

// Spoonacular API configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const SPOONACULAR_BASE_URL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com';

// Calculate BMR using Mifflin-St Jeor equation
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

// Calculate TDEE based on activity level
const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
    extremely_active: 2.0  // Added support for extremely_active
  };
  
  return bmr * activityMultipliers[activityLevel];
};

// Calculate daily nutrition targets
const calculateNutritionTargets = (tdee, healthGoal, weight, height, age, gender) => {
  let adjustedCalories = tdee;
  
  // Adjust calories based on health goal
  if (healthGoal === 'lose_weight') {
    adjustedCalories = tdee - 500; // 500 calorie deficit
  } else if (healthGoal === 'gain_weight') {
    adjustedCalories = tdee + 500; // 500 calorie surplus
  }
  
  // Calculate macros (default ratios)
  const proteinRatio = 0.25; // 25%
  const carbRatio = 0.45;    // 45%
  const fatRatio = 0.30;     // 30%
  
  const proteinGrams = Math.round((adjustedCalories * proteinRatio) / 4);
  const carbGrams = Math.round((adjustedCalories * carbRatio) / 4);
  const fatGrams = Math.round((adjustedCalories * fatRatio) / 9);
  
  return {
    dailyCalories: Math.round(adjustedCalories),
    macros: {
      protein: {
        grams: proteinGrams,
        percentage: proteinRatio * 100,
        calories: Math.round(adjustedCalories * proteinRatio)
      },
      carbohydrates: {
        grams: carbGrams,
        percentage: carbRatio * 100,
        calories: Math.round(adjustedCalories * carbRatio)
      },
      fat: {
        grams: fatGrams,
        percentage: fatRatio * 100,
        calories: Math.round(adjustedCalories * fatRatio)
      }
    }
  };
};

// Generate meal plan
exports.generateMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, preferences = {} } = req.body;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate that user profile is complete with all required fields
    const requiredFields = ['age', 'gender', 'height', 'weight', 'activityLevel', 'healthGoal'];
    const missingFields = requiredFields.filter(field => !user[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required profile fields: ${missingFields.join(', ')}`);
    }

    // Calculate or get nutrition targets
    let nutritionTargets = await NutritionTargets.findOne({ userId });
    
    if (!nutritionTargets) {
      // Calculate new targets
      const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
      
      if (isNaN(bmr)) {
        throw new Error('Invalid values for BMR calculation. Please check height, weight, age, and gender values.');
      }
      
      const tdee = calculateTDEE(bmr, user.activityLevel);
      
      if (isNaN(tdee)) {
        throw new Error('Invalid activity level for TDEE calculation.');
      }
      
      const targets = calculateNutritionTargets(
        tdee, user.healthGoal, user.weight, user.height, user.age, user.gender
      );

      // Validate targets before creating NutritionTargets
      if (!targets || Object.values(targets).some(val => val === null || val === undefined)) {
        throw new Error('Invalid nutrition target calculations. Please check all input values.');
      }

      const nutritionTargetData = {
        userId,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalories: targets.dailyCalories,
        macros: targets.macros,
        calculationParams: {
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activityLevel,
          healthGoal: user.healthGoal
        }
      };

      // Validate all required numeric fields are not NaN
      const validateNumber = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'object') {
            validateNumber(obj[key]);
          } else if (typeof obj[key] === 'number' && isNaN(obj[key])) {
            throw new Error(`Invalid numeric value for ${key}`);
          }
        }
      };

      validateNumber(nutritionTargetData);
      
      nutritionTargets = new NutritionTargets(nutritionTargetData);

      await nutritionTargets.save();
    }

    // Generate daily meal plans
    const dailyPlans = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dailyPlan = await generateDailyMealPlan(
        nutritionTargets,
        user.dietaryPreferences,
        preferences,
        date
      );
      dailyPlans.push(dailyPlan);
    }

    // Create meal plan
    const mealPlan = new MealPlan({
      userId,
      name: `Meal Plan ${startDate} to ${endDate}`,
      startDate: start,
      endDate: end,
      dailyPlans,
      preferences: {
        dietaryRestrictions: user.dietaryPreferences,
        calorieTarget: nutritionTargets.dailyCalories,
        macroRatios: {
          protein: nutritionTargets.macros.protein.percentage,
          carbohydrates: nutritionTargets.macros.carbohydrates.percentage,
          fat: nutritionTargets.macros.fat.percentage
        }
      }
    });

    await mealPlan.save();

    res.status(201).json({
      success: true,
      data: mealPlan,
      message: 'Meal plan generated successfully'
    });

  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({ message: 'Server error while generating meal plan' });
  }
};

// Generate daily meal plan
async function generateDailyMealPlan(nutritionTargets, dietaryPreferences, preferences, date) {
  const { dailyCalories, macros } = nutritionTargets;
  
  // Meal distribution percentages
  const mealDistribution = {
    breakfast: 0.25, // 25%
    lunch: 0.30,     // 30%
    dinner: 0.35,    // 35%
    snacks: 0.10     // 10%
  };

  const dailyPlan = {
    date: new Date(date),
    meals: [],
    totalNutrition: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    },
    targetNutrition: {
      calories: dailyCalories,
      protein: macros.protein.grams,
      carbohydrates: macros.carbohydrates.grams,
      fat: macros.fat.grams
    },
    nutritionProgress: {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    }
  };

  // Generate meals for each meal type
  for (const [mealType, percentage] of Object.entries(mealDistribution)) {
    if (mealType === 'snacks') {
      // Generate 2 snacks
      for (let i = 0; i < 2; i++) {
        const snack = await generateMeal(
          dailyCalories * percentage / 2,
          macros,
          dietaryPreferences,
          mealType
        );
        dailyPlan.meals.push(snack);
        updateDailyNutrition(dailyPlan, snack);
      }
    } else {
      const meal = await generateMeal(
        dailyCalories * percentage,
        macros,
        dietaryPreferences,
        mealType
      );
      dailyPlan.meals.push(meal);
      updateDailyNutrition(dailyPlan, meal);
    }
  }

  // Calculate progress percentages
  dailyPlan.nutritionProgress = {
    calories: Math.round((dailyPlan.totalNutrition.calories / dailyCalories) * 100),
    protein: Math.round((dailyPlan.totalNutrition.protein / macros.protein.grams) * 100),
    carbohydrates: Math.round((dailyPlan.totalNutrition.carbohydrates / macros.carbohydrates.grams) * 100),
    fat: Math.round((dailyPlan.totalNutrition.fat / macros.fat.grams) * 100)
  };

  return dailyPlan;
}

// Generate individual meal using Spoonacular API
async function generateMeal(targetCalories, macros, dietaryPreferences, mealType) {
  try {
    if (!RAPIDAPI_KEY) {
      console.log('RAPIDAPI_KEY not configured, using fallback meal');
      return createFallbackMeal(mealType, targetCalories);
    }

    // Map dietary preferences to Spoonacular diet types
    const dietMap = {
      'vegetarian': 'vegetarian',
      'vegan': 'vegan',
      'gluten-free': '',
      'dairy-free': '',
      'keto': 'ketogenic',
      'paleo': 'paleo'
    };

    const intoleranceMap = {
      'gluten-free': 'gluten',
      'dairy-free': 'dairy',
      'nut-free': 'tree nut'
    };

    const diet = dietaryPreferences?.find(pref => dietMap[pref]) || '';
    const intolerances = dietaryPreferences?.filter(pref => intoleranceMap[pref])
      .map(pref => intoleranceMap[pref]).join(',') || '';

    // Get meal type specific search terms
    const mealQueries = {
      breakfast: ['breakfast', 'pancakes', 'oatmeal', 'eggs', 'toast'],
      lunch: ['salad', 'sandwich', 'soup', 'bowl', 'lunch'],
      dinner: ['chicken', 'beef', 'fish', 'pasta', 'rice'],
      snacks: ['smoothie', 'nuts', 'fruit', 'yogurt', 'bar']
    };

    const query = mealQueries[mealType] ? 
      mealQueries[mealType][Math.floor(Math.random() * mealQueries[mealType].length)] : 
      'healthy meal';

    const options = {
      method: 'GET',
      url: `${SPOONACULAR_BASE_URL}/recipes/findByNutrients`,
      params: {
        minCalories: Math.max(targetCalories - 100, 0),
        maxCalories: targetCalories + 100,
        minProtein: Math.max((macros.protein.grams * 0.2) - 5, 0),
        maxProtein: (macros.protein.grams * 0.3) + 10,
        number: '5',
        offset: '0'
      },
      headers: {
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      }
    };

    const response = await axios.request(options);
    
    if (response.data && response.data.length > 0) {
      const recipe = response.data[Math.floor(Math.random() * response.data.length)];
      
      return [{
        food: {
          id: recipe.id,
          name: recipe.title,
          image: recipe.image,
          nutrition: {
            calories: recipe.calories || targetCalories,
            protein: recipe.protein || Math.round(targetCalories * 0.2 / 4),
            carbohydrates: recipe.carbs || Math.round(targetCalories * 0.5 / 4),
            fat: recipe.fat || Math.round(targetCalories * 0.3 / 9)
          }
        },
        quantity: 1,
        unit: 'serving',
        mealType,
        timeSlot: getMealTimeSlot(mealType)
      }];
    } else {
      return createFallbackMeal(mealType, targetCalories);
    }
  } catch (error) {
    console.error('Error generating meal with Spoonacular:', error);
    return createFallbackMeal(mealType, targetCalories);
  }
}

// Create fallback meal when API is not available
function createFallbackMeal(mealType, targetCalories) {
  const fallbackMeals = {
    breakfast: {
      name: 'Healthy Breakfast Bowl',
      foods: ['Oatmeal with Banana and Almonds']
    },
    lunch: {
      name: 'Balanced Lunch',
      foods: ['Grilled Chicken with Brown Rice']
    },
    dinner: {
      name: 'Nutritious Dinner',
      foods: ['Salmon with Quinoa and Vegetables']
    },
    snacks: {
      name: 'Healthy Snack',
      foods: ['Apple with Peanut Butter']
    }
  };

  const meal = fallbackMeals[mealType] || fallbackMeals.lunch;
  
  return [{
    food: {
      id: Math.random().toString(36).substr(2, 9),
      name: meal.foods[0],
      image: null,
      nutrition: {
        calories: targetCalories,
        protein: Math.round(targetCalories * 0.2 / 4),
        carbohydrates: Math.round(targetCalories * 0.5 / 4),
        fat: Math.round(targetCalories * 0.3 / 9)
      }
    },
    quantity: 1,
    unit: 'serving',
    mealType,
    timeSlot: getMealTimeSlot(mealType)
  }];
}

// Update daily nutrition totals
function updateDailyNutrition(dailyPlan, meal) {
  // Calculate nutrition from actual meal items
  meal.forEach(item => {
    const nutrition = item.food.nutrition;
    const quantity = item.quantity || 1;
    
    dailyPlan.totalNutrition.calories += Math.round((nutrition.calories || 0) * quantity);
    dailyPlan.totalNutrition.protein += Math.round((nutrition.protein || 0) * quantity);
    dailyPlan.totalNutrition.carbohydrates += Math.round((nutrition.carbohydrates || 0) * quantity);
    dailyPlan.totalNutrition.fat += Math.round((nutrition.fat || 0) * quantity);
    dailyPlan.totalNutrition.fiber += Math.round((nutrition.fiber || 2) * quantity);
    dailyPlan.totalNutrition.sugar += Math.round((nutrition.sugar || 3) * quantity);
    dailyPlan.totalNutrition.sodium += Math.round((nutrition.sodium || 150) * quantity);
  });
}

// Get meal time slot
function getMealTimeSlot(mealType) {
  const timeSlots = {
    breakfast: '8:00 AM',
    lunch: '12:00 PM',
    dinner: '7:00 PM',
    snacks: '3:00 PM'
  };
  return timeSlots[mealType] || '';
}

// Get current meal plan
exports.getCurrentMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await MealPlan.findOne({
      userId,
      startDate: { $lte: today },
      endDate: { $gte: today },
      status: 'active'
    }).populate('dailyPlans.meals.food');

    if (!mealPlan) {
      return res.status(404).json({ message: 'No active meal plan found' });
    }

    // Find today's plan
    const todayPlan = mealPlan.dailyPlans.find(plan => {
      const planDate = new Date(plan.date);
      planDate.setHours(0, 0, 0, 0);
      return planDate.getTime() === today.getTime();
    });

    res.json({
      success: true,
      data: {
        mealPlan,
        todayPlan: todayPlan || null
      }
    });

  } catch (error) {
    console.error('Get current meal plan error:', error);
    res.status(500).json({ message: 'Server error while fetching meal plan' });
  }
};

// Get nutrition targets
exports.getNutritionTargets = async (req, res) => {
  try {
    const userId = req.user.id;

    let nutritionTargets = await NutritionTargets.findOne({ userId });

    if (!nutritionTargets) {
      return res.status(404).json({ message: 'Nutrition targets not found. Please generate a meal plan first.' });
    }

    res.json({
      success: true,
      data: nutritionTargets
    });

  } catch (error) {
    console.error('Get nutrition targets error:', error);
    res.status(500).json({ message: 'Server error while fetching nutrition targets' });
  }
};

// Get meal plan templates
exports.getMealTemplates = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isTemplate: true };
    if (category) {
      query.templateCategory = category;
    }

    const templates = await MealPlan.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get meal templates error:', error);
    res.status(500).json({ message: 'Server error while fetching meal templates' });
  }
}; 