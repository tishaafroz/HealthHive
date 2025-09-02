const ProgressEntry = require('../models/ProgressEntry');
const Analytics = require('../models/Analytics');
const ProgressTrackingService = require('../services/ProgressTrackingService');
const AnalyticsService = require('../services/AnalyticsService');
const WorkoutSession = require('../models/WorkoutSession');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');

class ProgressController {
  static async addProgressEntry(req, res) {
    try {
      const entryData = req.body;
      entryData.userId = req.user.id;

      // Handle photo uploads if present
      if (entryData.photos) {
        entryData.photos = await this.processPhotoUploads(entryData.photos);
      }

      const entry = new ProgressEntry(entryData);
      await entry.save();

      // Generate analytics for the new entry
      await this.generateAnalytics(req.user.id);

      res.status(201).json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getProgressHistory(req, res) {
    try {
      const { startDate, endDate, metrics } = req.query;
      const query = { userId: req.user.id };

      if (startDate) query.date = { $gte: new Date(startDate) };
      if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

      let projection = {};
      if (metrics) {
        const selectedMetrics = metrics.split(',');
        selectedMetrics.forEach(metric => {
          projection[metric] = 1;
        });
      }

      const entries = await ProgressEntry.find(query, projection)
        .sort('date');

      res.json(entries);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateProgressEntry(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Handle photo updates if present
      if (updates.photos) {
        updates.photos = await this.processPhotoUploads(updates.photos);
      }

      const entry = await ProgressEntry.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        updates,
        { new: true }
      );

      if (!entry) {
        return res.status(404).json({ error: 'Progress entry not found' });
      }

      // Regenerate analytics after update
      await this.generateAnalytics(req.user.id);

      res.json(entry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteProgressEntry(req, res) {
    try {
      const { id } = req.params;
      const entry = await ProgressEntry.findOneAndDelete({
        _id: id,
        userId: req.user.id
      });

      if (!entry) {
        return res.status(404).json({ error: 'Progress entry not found' });
      }

      // Delete associated photos
      if (entry.photos && entry.photos.length > 0) {
        await this.deletePhotos(entry.photos);
      }

      // Regenerate analytics after deletion
      await this.generateAnalytics(req.user.id);

      res.json({ message: 'Progress entry deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getDashboardAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await Analytics.findOne({
        userId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });

      if (!analytics) {
        return res.status(404).json({ error: 'Analytics not found' });
      }

      res.json(analytics);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getWeightTrend(req, res) {
    try {
      const { period } = req.query;
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1); // Default to 1 month
      }

      const entries = await ProgressEntry.find({
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }, {
        date: 1,
        weight: 1
      }).sort('date');

      const trend = await AnalyticsService.calculateTrendAnalysis(
        entries.map(e => ({ date: e.date, value: e.weight })),
        { startDate, endDate }
      );

      res.json(trend);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getActivitySummary(req, res) {
    try {
      const summary = await AnalyticsService.generateWeeklyProgressReport(
        req.user.id,
        new Date()
      );

      res.json(summary);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getGoalProgress(req, res) {
    try {
      const { goalId } = req.query;
      const currentProgress = await ProgressTrackingService.calculateGoalProgress(
        req.user.id,
        goalId
      );

      const prediction = await ProgressTrackingService.predictGoalAchievement(
        req.user.id,
        currentProgress,
        req.user.goals[goalId],
        { startDate: new Date() }
      );

      res.json({
        currentProgress,
        prediction
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async comparePeriods(req, res) {
    try {
      const { period1, period2 } = req.params;
      
      const [analytics1, analytics2] = await Promise.all([
        Analytics.findOne({
          userId: req.user.id,
          startDate: new Date(period1)
        }),
        Analytics.findOne({
          userId: req.user.id,
          startDate: new Date(period2)
        })
      ]);

      if (!analytics1 || !analytics2) {
        return res.status(404).json({ error: 'Analytics not found for one or both periods' });
      }

      const comparison = this.compareAnalytics(analytics1, analytics2);
      res.json(comparison);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async processPhotoUploads(photos) {
    // Implementation would depend on your file upload service
    // This is a placeholder that assumes photos are already processed
    return photos;
  }

  static async deletePhotos(photos) {
    // Implementation would depend on your file storage service
    // This is a placeholder for photo deletion logic
    return true;
  }

  static async generateAnalytics(userId) {
    try {
      return await AnalyticsService.generateWeeklyProgressReport(userId, new Date());
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  }

  static compareAnalytics(analytics1, analytics2) {
    const comparison = {
      weightChange: {
        difference: analytics2.metrics.weightChange - analytics1.metrics.weightChange,
        percentageChange: ((analytics2.metrics.weightChange - analytics1.metrics.weightChange) / 
          Math.abs(analytics1.metrics.weightChange)) * 100
      },
      workouts: {
        difference: analytics2.metrics.workoutsCompleted - analytics1.metrics.workoutsCompleted,
        percentageChange: ((analytics2.metrics.workoutsCompleted - analytics1.metrics.workoutsCompleted) / 
          analytics1.metrics.workoutsCompleted) * 100
      },
      calories: {
        burned: {
          difference: analytics2.metrics.caloriesBurned - analytics1.metrics.caloriesBurned,
          percentageChange: ((analytics2.metrics.caloriesBurned - analytics1.metrics.caloriesBurned) / 
            analytics1.metrics.caloriesBurned) * 100
        },
        consumed: {
          difference: analytics2.metrics.caloriesConsumed - analytics1.metrics.caloriesConsumed,
          percentageChange: ((analytics2.metrics.caloriesConsumed - analytics1.metrics.caloriesConsumed) / 
            analytics1.metrics.caloriesConsumed) * 100
        }
      }
    };

    return {
      comparison,
      insights: this.generateComparisonInsights(comparison)
    };
  }

  static generateComparisonInsights(comparison) {
    const insights = [];

    // Weight change insights
    if (Math.abs(comparison.weightChange.difference) > 0) {
      insights.push({
        type: comparison.weightChange.difference < 0 ? 'positive' : 'negative',
        metric: 'weight',
        message: `Weight ${comparison.weightChange.difference < 0 ? 'decreased' : 'increased'} by ${Math.abs(comparison.weightChange.difference)}kg`
      });
    }

    // Workout completion insights
    if (comparison.workouts.difference !== 0) {
      insights.push({
        type: comparison.workouts.difference > 0 ? 'positive' : 'negative',
        metric: 'workouts',
        message: `Completed ${Math.abs(comparison.workouts.difference)} ${comparison.workouts.difference > 0 ? 'more' : 'fewer'} workouts`
      });
    }

    // Calorie insights
    const calorieBalance = comparison.calories.burned.difference - comparison.calories.consumed.difference;
    if (Math.abs(calorieBalance) > 1000) {
      insights.push({
        type: calorieBalance > 0 ? 'positive' : 'neutral',
        metric: 'calories',
        message: `Net calorie ${calorieBalance > 0 ? 'deficit' : 'surplus'} of ${Math.abs(calorieBalance)} calories`
      });
    }

    return insights;
  }
}

module.exports = ProgressController;
