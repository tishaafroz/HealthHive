const MealSchedule = require('../models/MealSchedule');
const Notification = require('../models/Notification');

class MealPlanningService {
  static async generateOptimalMealTimes(userSchedule, preferences) {
    // Calculate optimal meal times based on user's schedule and preferences
    const wakeTime = new Date(userSchedule.wakeTime);
    const sleepTime = new Date(userSchedule.sleepTime);
    const workoutTime = userSchedule.workoutTime ? new Date(userSchedule.workoutTime) : null;
    
    // Default meal spacing in hours
    const mealSpacing = preferences.mealSpacing || 3;
    
    // Calculate breakfast time (1 hour after wake time by default)
    const breakfastTime = new Date(wakeTime);
    breakfastTime.setHours(wakeTime.getHours() + 1);
    
    // Calculate lunch time (halfway between breakfast and dinner)
    const lunchTime = new Date(breakfastTime);
    lunchTime.setHours(breakfastTime.getHours() + 5);
    
    // Calculate dinner time (3 hours before sleep)
    const dinnerTime = new Date(sleepTime);
    dinnerTime.setHours(sleepTime.getHours() - 3);
    
    return {
      breakfast: breakfastTime,
      lunch: lunchTime,
      dinner: dinnerTime
    };
  }

  static async autoScheduleWeeklyMeals(userId, dietPlan) {
    const weeklySchedule = [];
    const today = new Date();
    
    // Schedule meals for next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Create meal schedules for each meal type
      const dayMeals = await Promise.all(['breakfast', 'lunch', 'dinner'].map(async mealType => {
        const meal = dietPlan[mealType];
        const scheduledTime = this.calculateMealTime(date, mealType);
        
        return new MealSchedule({
          userId,
          mealType,
          scheduledTime,
          mealName: meal.name,
          calories: meal.calories,
          ingredients: meal.ingredients,
          recurring: {
            enabled: true,
            frequency: 'weekly',
            daysOfWeek: [date.getDay()]
          }
        });
      }));
      
      weeklySchedule.push(...dayMeals);
    }
    
    // Save all meal schedules
    return await MealSchedule.insertMany(weeklySchedule);
  }

  static async handleMealRescheduling(mealId, newTime, cascadeEffect = false) {
    const meal = await MealSchedule.findById(mealId);
    if (!meal) throw new Error('Meal schedule not found');

    // Update the meal time
    meal.scheduledTime = newTime;
    await meal.save();

    if (cascadeEffect) {
      // Adjust subsequent meals if needed
      const laterMeals = await MealSchedule.find({
        userId: meal.userId,
        scheduledTime: { $gt: meal.scheduledTime },
        _id: { $ne: meal._id }
      }).sort('scheduledTime');

      // Ensure minimum spacing between meals
      for (const laterMeal of laterMeals) {
        const minSpacing = 2 * 60 * 60 * 1000; // 2 hours minimum between meals
        const previousMeal = await MealSchedule.findOne({
          userId: meal.userId,
          scheduledTime: { $lt: laterMeal.scheduledTime }
        }).sort('-scheduledTime');

        if (previousMeal) {
          const timeDiff = laterMeal.scheduledTime - previousMeal.scheduledTime;
          if (timeDiff < minSpacing) {
            laterMeal.scheduledTime = new Date(previousMeal.scheduledTime.getTime() + minSpacing);
            await laterMeal.save();
          }
        }
      }
    }

    // Update notifications
    await Notification.updateMany(
      { mealScheduleId: mealId },
      { scheduledTime: new Date(newTime.getTime() - 30 * 60000) } // 30 minutes before meal
    );

    return meal;
  }

  static calculateMealPrepTime(meal, ingredients) {
    // Base prep time in minutes
    let prepTime = 15;

    // Add time based on number of ingredients
    prepTime += ingredients.length * 5;

    // Add time based on cooking methods (example logic)
    const cookingMethods = this.identifyCookingMethods(meal.name);
    for (const method of cookingMethods) {
      switch (method) {
        case 'bake':
          prepTime += 30;
          break;
        case 'grill':
          prepTime += 20;
          break;
        case 'boil':
          prepTime += 15;
          break;
        default:
          prepTime += 10;
      }
    }

    return Math.min(prepTime, 120); // Cap at 2 hours
  }

  static async suggestMealAlternatives(originalMeal, dietaryRestrictions) {
    // Query similar meals that meet dietary restrictions
    const alternatives = await MealSchedule.aggregate([
      {
        $match: {
          calories: {
            $gte: originalMeal.calories * 0.9,
            $lte: originalMeal.calories * 1.1
          },
          // Filter based on dietary restrictions
          ingredients: {
            $nin: dietaryRestrictions
          }
        }
      },
      {
        $sample: { size: 3 } // Get 3 random alternatives
      }
    ]);

    return alternatives;
  }

  static identifyCookingMethods(mealName) {
    const cookingMethods = ['bake', 'grill', 'boil', 'fry', 'steam'];
    return cookingMethods.filter(method => 
      mealName.toLowerCase().includes(method)
    );
  }

  static calculateMealTime(date, mealType) {
    const mealTime = new Date(date);
    switch (mealType) {
      case 'breakfast':
        mealTime.setHours(8, 0, 0);
        break;
      case 'lunch':
        mealTime.setHours(13, 0, 0);
        break;
      case 'dinner':
        mealTime.setHours(19, 0, 0);
        break;
    }
    return mealTime;
  }
}

module.exports = MealPlanningService;
