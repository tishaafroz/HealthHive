const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutSession = require('../models/WorkoutSession');

class WorkoutGenerationService {
  static async createProgressiveWorkoutPlan(userId, currentFitness, goals, equipment) {
    // Determine workout difficulty based on current fitness level
    const difficulty = this.determineDifficulty(currentFitness);
    
    // Get suitable exercises based on equipment and difficulty
    const exercises = await Exercise.find({
      equipment: { $in: equipment },
      difficulty: { $lte: difficulty }
    });

    // Generate workout plan structure
    const workoutPlan = new WorkoutPlan({
      userId,
      planName: `${goals.primary} Focus Plan`,
      goal: goals.primary,
      difficulty,
      durationWeeks: 4,
      workoutsPerWeek: this.determineWorkoutFrequency(currentFitness, goals),
      estimatedTimePerWorkout: this.calculateWorkoutDuration(currentFitness),
      exercises: this.selectExercises(exercises, goals, equipment)
    });

    return await workoutPlan.save();
  }

  static async calculateRestDays(workoutIntensity, recoveryMetrics) {
    // Base rest days based on workout intensity
    let restDays = Math.ceil(workoutIntensity / 3);

    // Adjust based on recovery metrics
    if (recoveryMetrics.soreness > 7) restDays++;
    if (recoveryMetrics.fatigue > 7) restDays++;
    if (recoveryMetrics.sleepQuality < 5) restDays++;

    // Cap rest days
    return Math.min(Math.max(restDays, 1), 3);
  }

  static async adjustWorkoutDifficulty(performanceData, userFeedback) {
    const {
      completionRate,
      averageIntensity,
      userRating
    } = performanceData;

    // Calculate difficulty adjustment
    let difficultyAdjustment = 0;

    // Adjust based on completion rate (0-100%)
    if (completionRate > 90) difficultyAdjustment += 0.5;
    else if (completionRate < 60) difficultyAdjustment -= 0.5;

    // Adjust based on intensity feedback (1-10)
    if (averageIntensity > 8) difficultyAdjustment -= 0.3;
    else if (averageIntensity < 5) difficultyAdjustment += 0.3;

    // Adjust based on user rating (1-5)
    if (userRating <= 2) difficultyAdjustment -= 0.5;
    else if (userRating >= 4) difficultyAdjustment += 0.2;

    return Math.round(difficultyAdjustment * 10) / 10;
  }

  static async generateCardioRecommendations(heartRateData, enduranceGoals) {
    const recommendations = [];
    const maxHeartRate = 220 - heartRateData.age;

    // Define heart rate zones
    const zones = {
      recovery: [0.6, 0.7],
      aerobic: [0.7, 0.8],
      anaerobic: [0.8, 0.9],
      peak: [0.9, 1.0]
    };

    // Generate recommendations based on goals
    switch (enduranceGoals.focus) {
      case 'endurance':
        recommendations.push({
          type: 'cardio',
          duration: 45,
          targetHeartRate: Math.round(maxHeartRate * zones.aerobic[0]),
          intensity: 'moderate'
        });
        break;
      case 'fatBurn':
        recommendations.push({
          type: 'interval',
          duration: 30,
          intervals: [
            { intensity: 'high', duration: 1 },
            { intensity: 'low', duration: 2 }
          ],
          targetHeartRate: Math.round(maxHeartRate * zones.anaerobic[0])
        });
        break;
      case 'performance':
        recommendations.push({
          type: 'hiit',
          duration: 20,
          intervals: [
            { intensity: 'max', duration: 0.5 },
            { intensity: 'recovery', duration: 1 }
          ],
          targetHeartRate: Math.round(maxHeartRate * zones.peak[0])
        });
        break;
    }

    return recommendations;
  }

  static async trackStrengthProgression(exerciseHistory, muscleGroup) {
    // Get exercise history for specific muscle group
    const workouts = await WorkoutSession.find({
      'exercises.muscleGroups': muscleGroup,
      isCompleted: true
    }).sort('scheduledDate');

    // Calculate progression metrics
    const progression = workouts.map(workout => {
      const relevantExercises = workout.exercises.filter(e => 
        e.muscleGroups.includes(muscleGroup)
      );

      return {
        date: workout.scheduledDate,
        volume: this.calculateTotalVolume(relevantExercises),
        maxWeight: this.findMaxWeight(relevantExercises),
        rpeAverage: this.calculateRPEAverage(relevantExercises)
      };
    });

    // Calculate improvement rates
    const improvements = this.calculateImprovements(progression);

    return {
      progression,
      improvements,
      recommendations: this.generateProgressionRecommendations(improvements)
    };
  }

  static determineDifficulty(currentFitness) {
    const { experienceLevel, strengthLevel, enduranceLevel } = currentFitness;
    
    // Calculate average fitness level
    const avgLevel = (strengthLevel + enduranceLevel) / 2;
    
    if (experienceLevel === 'beginner' || avgLevel < 4) return 'beginner';
    if (experienceLevel === 'intermediate' || avgLevel < 7) return 'intermediate';
    return 'advanced';
  }

  static determineWorkoutFrequency(currentFitness, goals) {
    const { experienceLevel, timeAvailable } = currentFitness;
    
    // Base frequency on experience level
    let frequency = experienceLevel === 'beginner' ? 3 :
                   experienceLevel === 'intermediate' ? 4 : 5;

    // Adjust based on time available
    if (timeAvailable < frequency * 2) {
      frequency = Math.floor(timeAvailable / 2);
    }

    // Ensure minimum and maximum values
    return Math.min(Math.max(frequency, 2), 6);
  }

  static calculateWorkoutDuration(currentFitness) {
    const { experienceLevel, timeAvailable } = currentFitness;
    
    // Base duration on experience level (in minutes)
    const baseDuration = experienceLevel === 'beginner' ? 30 :
                        experienceLevel === 'intermediate' ? 45 : 60;

    // Adjust based on available time
    return Math.min(baseDuration, timeAvailable);
  }

  static selectExercises(exercises, goals, equipment) {
    const selectedExercises = [];
    const { primary, secondary } = goals;

    // Filter exercises based on goals and equipment
    const suitableExercises = exercises.filter(exercise => 
      exercise.equipment.some(eq => equipment.includes(eq))
    );

    // Select primary goal exercises
    const primaryExercises = suitableExercises.filter(exercise => 
      this.matchesGoal(exercise, primary)
    );
    selectedExercises.push(...this.pickTopExercises(primaryExercises, 3));

    // Select secondary goal exercises
    const secondaryExercises = suitableExercises.filter(exercise => 
      this.matchesGoal(exercise, secondary)
    );
    selectedExercises.push(...this.pickTopExercises(secondaryExercises, 2));

    return selectedExercises.map(exercise => ({
      exerciseId: exercise._id,
      sets: this.calculateSets(exercise, goals),
      reps: this.calculateReps(exercise, goals),
      restTime: this.calculateRestTime(exercise)
    }));
  }

  static matchesGoal(exercise, goal) {
    const goalMappings = {
      'strength': ['strength'],
      'endurance': ['cardio', 'endurance'],
      'weight_loss': ['cardio', 'hiit'],
      'muscle_gain': ['strength', 'hypertrophy']
    };

    return goalMappings[goal].includes(exercise.category);
  }

  static pickTopExercises(exercises, count) {
    // Sort by effectiveness and pick top exercises
    return exercises
      .sort(() => Math.random() - 0.5) // Simple randomization
      .slice(0, count);
  }

  static calculateSets(exercise, goals) {
    switch (goals.primary) {
      case 'strength':
        return 5;
      case 'muscle_gain':
        return 4;
      case 'endurance':
        return 3;
      default:
        return 3;
    }
  }

  static calculateReps(exercise, goals) {
    switch (goals.primary) {
      case 'strength':
        return 5;
      case 'muscle_gain':
        return 12;
      case 'endurance':
        return 15;
      default:
        return 10;
    }
  }

  static calculateRestTime(exercise) {
    switch (exercise.category) {
      case 'strength':
        return 180; // 3 minutes
      case 'cardio':
        return 60; // 1 minute
      default:
        return 90; // 1.5 minutes
    }
  }

  static calculateTotalVolume(exercises) {
    return exercises.reduce((total, exercise) => {
      return total + (exercise.weight * exercise.reps * exercise.sets);
    }, 0);
  }

  static findMaxWeight(exercises) {
    return Math.max(...exercises.map(e => e.weight));
  }

  static calculateRPEAverage(exercises) {
    const totalRPE = exercises.reduce((sum, e) => sum + (e.rpe || 0), 0);
    return totalRPE / exercises.length;
  }

  static calculateImprovements(progression) {
    if (progression.length < 2) return {};

    const first = progression[0];
    const last = progression[progression.length - 1];

    return {
      volumeImprovement: ((last.volume - first.volume) / first.volume) * 100,
      weightImprovement: ((last.maxWeight - first.maxWeight) / first.maxWeight) * 100,
      rpeChange: last.rpeAverage - first.rpeAverage
    };
  }

  static generateProgressionRecommendations(improvements) {
    const recommendations = [];

    if (improvements.volumeImprovement < 5) {
      recommendations.push('Consider increasing workout volume');
    }
    if (improvements.weightImprovement < 2) {
      recommendations.push('Focus on progressive overload');
    }
    if (improvements.rpeChange > 1) {
      recommendations.push('Consider deload week');
    }

    return recommendations;
  }
}

module.exports = WorkoutGenerationService;
