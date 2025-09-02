const Analytics = require('../models/Analytics');
const ProgressEntry = require('../models/ProgressEntry');
const WorkoutSession = require('../models/WorkoutSession');
const MealSchedule = require('../models/MealSchedule');

class AnalyticsService {
  static async generateWeeklyProgressReport(userId, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Get all relevant data for the week
    const [progress, workouts, meals] = await Promise.all([
      ProgressEntry.find({
        userId,
        date: { $gte: startDate, $lt: endDate }
      }),
      WorkoutSession.find({
        userId,
        scheduledDate: { $gte: startDate, $lt: endDate }
      }),
      MealSchedule.find({
        userId,
        scheduledTime: { $gte: startDate, $lt: endDate }
      })
    ]);

    // Calculate metrics
    const metrics = this.calculateMetrics(progress, workouts, meals);
    
    // Analyze trends
    const trends = await this.analyzeTrends(userId, startDate, metrics);
    
    // Check for achievements
    const achievements = await this.checkAchievements(userId, metrics);

    // Create analytics entry
    const analytics = new Analytics({
      userId,
      period: 'weekly',
      startDate,
      endDate,
      metrics,
      trends,
      achievements
    });

    return await analytics.save();
  }

  static calculateMetrics(progressEntries, workouts, meals) {
    // Calculate weight change
    const weightChange = progressEntries.length >= 2 ? 
      progressEntries[progressEntries.length - 1].weight - progressEntries[0].weight : 0;

    // Calculate calories
    const caloriesBurned = workouts.reduce((total, workout) => 
      total + (workout.totalCaloriesBurned || 0), 0);
    
    const caloriesConsumed = meals.reduce((total, meal) => 
      total + (meal.calories || 0), 0);

    // Calculate completion rates
    const workoutsCompleted = workouts.filter(w => w.isCompleted).length;
    const mealsCompleted = meals.filter(m => m.isCompleted).length;

    // Calculate average BMI if height is available
    const averageBMI = progressEntries.length > 0 ? 
      this.calculateAverageBMI(progressEntries) : null;

    return {
      weightChange,
      caloriesBurned,
      caloriesConsumed,
      workoutsCompleted,
      mealsCompleted,
      averageBMI,
      goalProgress: this.calculateGoalProgress(weightChange, caloriesBurned, caloriesConsumed)
    };
  }

  static async analyzeTrends(userId, currentDate, currentMetrics) {
    // Get previous period metrics
    const previousStartDate = new Date(currentDate);
    previousStartDate.setDate(previousStartDate.getDate() - 7);
    
    const previousAnalytics = await Analytics.findOne({
      userId,
      period: 'weekly',
      startDate: previousStartDate
    });

    if (!previousAnalytics) {
      return {
        weightTrend: 'stable',
        activityTrend: 'stable',
        complianceTrend: 'stable'
      };
    }

    return {
      weightTrend: this.determineTrend(currentMetrics.weightChange, previousAnalytics.metrics.weightChange),
      activityTrend: this.determineTrend(
        currentMetrics.workoutsCompleted,
        previousAnalytics.metrics.workoutsCompleted
      ),
      complianceTrend: this.determineTrend(
        currentMetrics.mealsCompleted / (currentMetrics.workoutsCompleted || 1),
        previousAnalytics.metrics.mealsCompleted / (previousAnalytics.metrics.workoutsCompleted || 1)
      )
    };
  }

  static async checkAchievements(userId, metrics) {
    const achievements = [];

    // Weight loss milestone
    if (metrics.weightChange < -2) {
      achievements.push({
        type: 'milestone',
        title: 'Weight Loss Warrior',
        description: 'Lost more than 2 kg in a week!',
        unlockedAt: new Date(),
        iconUrl: '/icons/weight-loss.png'
      });
    }

    // Workout streak
    if (metrics.workoutsCompleted >= 5) {
      achievements.push({
        type: 'streak',
        title: 'Workout Warrior',
        description: 'Completed 5 or more workouts this week!',
        unlockedAt: new Date(),
        iconUrl: '/icons/workout-streak.png'
      });
    }

    // Perfect meal compliance
    if (metrics.mealsCompleted >= 21) { // 3 meals * 7 days
      achievements.push({
        type: 'improvement',
        title: 'Perfect Nutrition',
        description: 'Followed all scheduled meals for the week!',
        unlockedAt: new Date(),
        iconUrl: '/icons/perfect-meals.png'
      });
    }

    return achievements;
  }

  static calculateAverageBMI(progressEntries) {
    // Assuming user height is stored in the first entry
    if (!progressEntries[0].height) return null;

    const height = progressEntries[0].height / 100; // Convert to meters
    const totalBMI = progressEntries.reduce((sum, entry) => {
      const bmi = entry.weight / (height * height);
      return sum + bmi;
    }, 0);

    return totalBMI / progressEntries.length;
  }

  static calculateGoalProgress(weightChange, caloriesBurned, caloriesConsumed) {
    // Simple example: if goal is weight loss, positive progress means calories burned > consumed
    const calorieDifference = caloriesBurned - caloriesConsumed;
    const weightChangeImpact = weightChange < 0 ? 100 : 0; // Simplified logic
    
    return Math.min(100, Math.max(0, 
      (weightChangeImpact + (calorieDifference > 0 ? 50 : 0)) / 1.5
    ));
  }

  static determineTrend(currentValue, previousValue) {
    const difference = currentValue - previousValue;
    const threshold = Math.abs(previousValue * 0.05); // 5% change threshold

    if (Math.abs(difference) < threshold) {
      return 'stable';
    }
    return difference > 0 ? 'increasing' : 'decreasing';
  }
}

module.exports = AnalyticsService;
