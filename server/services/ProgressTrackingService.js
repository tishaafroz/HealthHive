const ProgressEntry = require('../models/ProgressEntry');
const Analytics = require('../models/Analytics');
const WorkoutSession = require('../models/WorkoutSession');
const MealSchedule = require('../models/MealSchedule');

class ProgressTrackingService {
  static async generateWeeklyProgressReport(userId, startDate) {
    // Get all data for the week
    const [progressEntries, workouts, meals] = await Promise.all([
      this.getProgressEntries(userId, startDate),
      this.getWorkoutData(userId, startDate),
      this.getMealData(userId, startDate)
    ]);

    // Generate comprehensive analysis
    const analysis = await this.analyzeProgress(progressEntries, workouts, meals);

    // Create report
    return {
      timeframe: {
        start: startDate,
        end: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      metrics: analysis.metrics,
      insights: analysis.insights,
      recommendations: this.generateRecommendations(analysis)
    };
  }

  static async calculateTrendAnalysis(dataPoints, timeframe) {
    const sortedData = dataPoints.sort((a, b) => a.date - b.date);
    
    // Calculate moving averages
    const movingAverages = this.calculateMovingAverages(sortedData);
    
    // Calculate rate of change
    const rateOfChange = this.calculateRateOfChange(sortedData);
    
    // Determine trend direction
    const trend = this.determineTrendDirection(rateOfChange);
    
    // Identify patterns
    const patterns = this.identifyPatterns(sortedData, movingAverages);
    
    return {
      trend,
      patterns,
      movingAverages,
      rateOfChange
    };
  }

  static async predictGoalAchievement(userId, currentProgress, targetGoal, timeline) {
    // Get historical data
    const historicalData = await this.getHistoricalProgress(userId);
    
    // Calculate progress rate
    const progressRate = this.calculateProgressRate(historicalData);
    
    // Estimate time to goal
    const timeToGoal = this.estimateTimeToGoal(currentProgress, targetGoal, progressRate);
    
    // Calculate confidence score
    const confidence = this.calculatePredictionConfidence(historicalData, progressRate);
    
    return {
      estimatedCompletion: timeToGoal,
      confidenceScore: confidence,
      factorsAffectingProgress: this.identifyProgressFactors(historicalData)
    };
  }

  static async detectProgressPlateaus(userId, metricHistory, alertThreshold) {
    const plateauPeriods = [];
    let currentPlateau = null;
    
    // Analyze metric history for plateaus
    for (let i = 1; i < metricHistory.length; i++) {
      const change = Math.abs(metricHistory[i].value - metricHistory[i-1].value);
      
      if (change < alertThreshold) {
        if (!currentPlateau) {
          currentPlateau = {
            start: metricHistory[i-1].date,
            metric: metricHistory[i].type
          };
        }
      } else if (currentPlateau) {
        currentPlateau.end = metricHistory[i-1].date;
        currentPlateau.duration = this.calculateDuration(currentPlateau.start, currentPlateau.end);
        plateauPeriods.push(currentPlateau);
        currentPlateau = null;
      }
    }
    
    return plateauPeriods;
  }

  static async generatePersonalizedInsights(userBehavior, progressData) {
    const insights = [];
    
    // Analyze workout consistency
    const workoutConsistency = this.analyzeWorkoutConsistency(userBehavior.workouts);
    if (workoutConsistency < 0.7) {
      insights.push({
        type: 'improvement_needed',
        area: 'workout_consistency',
        message: 'Your workout consistency has room for improvement'
      });
    }
    
    // Analyze meal plan adherence
    const mealAdherence = this.analyzeMealAdherence(userBehavior.meals);
    if (mealAdherence > 0.8) {
      insights.push({
        type: 'positive',
        area: 'nutrition',
        message: 'Great job sticking to your meal plan!'
      });
    }
    
    // Analyze progress rate
    const progressRate = this.analyzeProgressRate(progressData);
    insights.push({
      type: 'information',
      area: 'progress_rate',
      message: `You're progressing at ${progressRate.description} rate`
    });
    
    return insights;
  }

  static async getProgressEntries(userId, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return await ProgressEntry.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort('date');
  }

  static async getWorkoutData(userId, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return await WorkoutSession.find({
      userId,
      scheduledDate: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort('scheduledDate');
  }

  static async getMealData(userId, startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return await MealSchedule.find({
      userId,
      scheduledTime: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort('scheduledTime');
  }

  static async analyzeProgress(progressEntries, workouts, meals) {
    const metrics = {
      weightChange: this.calculateWeightChange(progressEntries),
      bodyComposition: this.analyzeBodyComposition(progressEntries),
      workoutMetrics: this.analyzeWorkouts(workouts),
      nutritionMetrics: this.analyzeMeals(meals)
    };

    const insights = this.generateInsights(metrics);

    return { metrics, insights };
  }

  static calculateWeightChange(progressEntries) {
    if (progressEntries.length < 2) return 0;
    const firstEntry = progressEntries[0];
    const lastEntry = progressEntries[progressEntries.length - 1];
    return lastEntry.weight - firstEntry.weight;
  }

  static analyzeBodyComposition(progressEntries) {
    return progressEntries.map(entry => ({
      date: entry.date,
      weight: entry.weight,
      bodyFat: entry.bodyFat,
      muscleMass: entry.muscleMass
    }));
  }

  static analyzeWorkouts(workouts) {
    return {
      totalWorkouts: workouts.length,
      completedWorkouts: workouts.filter(w => w.isCompleted).length,
      averageIntensity: this.calculateAverageIntensity(workouts),
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0)
    };
  }

  static analyzeMeals(meals) {
    return {
      totalMeals: meals.length,
      completedMeals: meals.filter(m => m.isCompleted).length,
      averageCalories: this.calculateAverageCalories(meals),
      mealAdherence: meals.filter(m => m.isCompleted).length / meals.length
    };
  }

  static calculateMovingAverages(data) {
    const windowSizes = [3, 7, 14];
    const movingAverages = {};

    windowSizes.forEach(size => {
      movingAverages[size] = data.map((_, index, array) => {
        if (index < size - 1) return null;
        const window = array.slice(index - size + 1, index + 1);
        return this.calculateAverage(window.map(d => d.value));
      }).filter(v => v !== null);
    });

    return movingAverages;
  }

  static calculateRateOfChange(data) {
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push({
        date: data[i].date,
        change: data[i].value - data[i-1].value,
        percentChange: ((data[i].value - data[i-1].value) / data[i-1].value) * 100
      });
    }
    return changes;
  }

  static determineTrendDirection(rateOfChange) {
    const recentChanges = rateOfChange.slice(-5);
    const averageChange = this.calculateAverage(recentChanges.map(c => c.change));
    
    if (Math.abs(averageChange) < 0.1) return 'stable';
    return averageChange > 0 ? 'increasing' : 'decreasing';
  }

  static identifyPatterns(data, movingAverages) {
    const patterns = [];

    // Check for plateaus
    if (this.isPlateauPattern(movingAverages[7])) {
      patterns.push('plateau');
    }

    // Check for consistent progress
    if (this.isConsistentProgress(movingAverages[14])) {
      patterns.push('consistent_progress');
    }

    // Check for volatility
    if (this.isHighVolatility(data)) {
      patterns.push('high_volatility');
    }

    return patterns;
  }

  static calculateAverage(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  static isPlateauPattern(movingAverage) {
    const variance = this.calculateVariance(movingAverage);
    return variance < 0.1;
  }

  static isConsistentProgress(movingAverage) {
    const changes = this.calculateRateOfChange(movingAverage);
    return changes.every(change => change.change > 0);
  }

  static isHighVolatility(data) {
    const values = data.map(d => d.value);
    const variance = this.calculateVariance(values);
    return variance > 1;
  }

  static calculateVariance(numbers) {
    const avg = this.calculateAverage(numbers);
    const squareDiffs = numbers.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    return this.calculateAverage(squareDiffs);
  }

  static calculateDuration(start, end) {
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  }

  static analyzeWorkoutConsistency(workouts) {
    const completedWorkouts = workouts.filter(w => w.isCompleted);
    return completedWorkouts.length / workouts.length;
  }

  static analyzeMealAdherence(meals) {
    const completedMeals = meals.filter(m => m.isCompleted);
    return completedMeals.length / meals.length;
  }

  static analyzeProgressRate(progressData) {
    const weeklyChange = this.calculateWeeklyChange(progressData);
    
    return {
      value: weeklyChange,
      description: this.getProgressRateDescription(weeklyChange)
    };
  }

  static calculateWeeklyChange(progressData) {
    if (progressData.length < 2) return 0;
    const weeklyChanges = [];
    
    for (let i = 1; i < progressData.length; i++) {
      const weeklyChange = progressData[i].value - progressData[i-1].value;
      weeklyChanges.push(weeklyChange);
    }
    
    return this.calculateAverage(weeklyChanges);
  }

  static getProgressRateDescription(weeklyChange) {
    if (weeklyChange <= 0) return 'maintaining';
    if (weeklyChange < 0.5) return 'slow';
    if (weeklyChange < 1) return 'moderate';
    return 'fast';
  }
}

module.exports = ProgressTrackingService;
