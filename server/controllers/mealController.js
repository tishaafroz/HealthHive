const MealPlan = require('../models/MealPlan');
const NutritionTargets = require('../models/NutritionTargets');
const Food = require('../models/Food');
const User = require('../models/User');

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
    very_active: 1.9
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

    // Calculate or get nutrition targets
    let nutritionTargets = await NutritionTargets.findOne({ userId });
    
    if (!nutritionTargets) {
      // Calculate new targets
      const bmr = calculateBMR(user.weight, user.height, user.age, user.gender);
      const tdee = calculateTDEE(bmr, user.activityLevel);
      const targets = calculateNutritionTargets(
        tdee, user.healthGoal, user.weight, user.height, user.age, user.gender
      );

      nutritionTargets = new NutritionTargets({
        userId,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        ...targets,
        calculationParams: {
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activityLevel,
          healthGoal: user.healthGoal
        }
      });

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

// Generate individual meal
async function generateMeal(targetCalories, macros, dietaryPreferences, mealType) {
  // Simple meal generation - in a real app, this would be more sophisticated
  const foods = await Food.find({
    'nutrition.calories': { $lte: targetCalories * 1.2 },
    isCustom: false // Start with verified foods
  }).limit(50);

  if (foods.length === 0) {
    // Fallback to any available food
    const fallbackFoods = await Food.find().limit(20);
    foods.push(...fallbackFoods);
  }

  // Select random foods to create meal
  const selectedFoods = [];
  let currentCalories = 0;
  let attempts = 0;
  const maxAttempts = 10;

  while (currentCalories < targetCalories * 0.8 && attempts < maxAttempts) {
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    const servingSize = Math.random() * 2 + 0.5; // 0.5 to 2.5 servings
    
    const mealItem = {
      food: randomFood._id,
      quantity: servingSize,
      unit: randomFood.servingSize.unit,
      mealType,
      timeSlot: getMealTimeSlot(mealType)
    };

    selectedFoods.push(mealItem);
    currentCalories += randomFood.nutrition.calories * servingSize;
    attempts++;
  }

  return selectedFoods;
}

// Update daily nutrition totals
function updateDailyNutrition(dailyPlan, meal) {
  // This would calculate nutrition based on actual food items
  // For now, we'll use placeholder values
  dailyPlan.totalNutrition.calories += 250; // Placeholder
  dailyPlan.totalNutrition.protein += 15;   // Placeholder
  dailyPlan.totalNutrition.carbohydrates += 30; // Placeholder
  dailyPlan.totalNutrition.fat += 8;        // Placeholder
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