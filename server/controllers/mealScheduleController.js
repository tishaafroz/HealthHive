const MealSchedule = require('../models/MealSchedule');
const MealPlanningService = require('../services/MealPlanningService');
const NotificationService = require('../services/NotificationService');

class MealScheduleController {
  static async createSchedule(req, res) {
    try {
      const mealData = req.body;
      mealData.userId = req.user.id;

      const meal = new MealSchedule(mealData);
      await meal.save();

      // Schedule notification for the meal
      await NotificationService.scheduleNotifications(
        meal._id,
        'meal_reminder',
        meal.scheduledTime,
        `Time to prepare ${meal.mealName}!`
      );

      res.status(201).json(meal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getMealsByDate(req, res) {
    try {
      const { date } = req.params;
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const meals = await MealSchedule.find({
        userId: req.user.id,
        scheduledTime: {
          $gte: startDate,
          $lt: endDate
        }
      }).sort('scheduledTime');

      res.json(meals);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const meal = await MealSchedule.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        updates,
        { new: true }
      );

      if (!meal) {
        return res.status(404).json({ error: 'Meal schedule not found' });
      }

      // Update notification if time changed
      if (updates.scheduledTime) {
        await NotificationService.scheduleNotifications(
          meal._id,
          'meal_reminder',
          meal.scheduledTime,
          `Time to prepare ${meal.mealName}!`
        );
      }

      res.json(meal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      const meal = await MealSchedule.findOneAndDelete({
        _id: id,
        userId: req.user.id
      });

      if (!meal) {
        return res.status(404).json({ error: 'Meal schedule not found' });
      }

      // Delete associated notifications
      await NotificationService.deleteNotifications(meal._id);

      res.json({ message: 'Meal schedule deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async completeMeal(req, res) {
    try {
      const { id } = req.params;
      const meal = await MealSchedule.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        {
          isCompleted: true,
          completedAt: new Date()
        },
        { new: true }
      );

      if (!meal) {
        return res.status(404).json({ error: 'Meal schedule not found' });
      }

      res.json(meal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async generateWeeklyPlan(req, res) {
    try {
      const { preferences } = req.body;
      
      // Get optimal meal times based on user schedule
      const mealTimes = await MealPlanningService.generateOptimalMealTimes(
        req.user.schedule,
        preferences
      );

      // Auto-schedule meals for the week
      const weeklySchedule = await MealPlanningService.autoScheduleWeeklyMeals(
        req.user.id,
        req.user.dietPlan
      );

      res.json(weeklySchedule);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async suggestAlternatives(req, res) {
    try {
      const { mealId } = req.params;
      const meal = await MealSchedule.findById(mealId);

      if (!meal) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      const alternatives = await MealPlanningService.suggestMealAlternatives(
        meal,
        req.user.dietaryRestrictions
      );

      res.json(alternatives);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = MealScheduleController;
