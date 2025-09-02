const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutSession = require('../models/WorkoutSession');
const WorkoutGenerationService = require('../services/WorkoutGenerationService');
const NotificationService = require('../services/NotificationService');

class WorkoutController {
  static async getExercises(req, res) {
    try {
      const { category, difficulty, equipment } = req.query;
      const query = {};

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (equipment) query.equipment = { $in: equipment.split(',') };

      const exercises = await Exercise.find(query);
      res.json(exercises);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async searchExercises(req, res) {
    try {
      const { q, muscleGroup } = req.query;
      const query = {};

      if (q) {
        query.$text = { $search: q };
      }
      if (muscleGroup) {
        query.muscleGroups = muscleGroup;
      }

      const exercises = await Exercise.find(query)
        .sort({ score: { $meta: 'textScore' } });

      res.json(exercises);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createWorkoutPlan(req, res) {
    try {
      const planData = req.body;
      planData.userId = req.user.id;

      const workoutPlan = new WorkoutPlan(planData);
      await workoutPlan.save();

      // Create workout sessions for the plan
      const sessions = await this.createWorkoutSessions(workoutPlan);

      res.status(201).json({
        plan: workoutPlan,
        sessions
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUserWorkoutPlans(req, res) {
    try {
      const plans = await WorkoutPlan.find({
        userId: req.user.id,
        isActive: true
      }).populate('exercises.exerciseId');

      res.json(plans);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateWorkoutPlan(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const plan = await WorkoutPlan.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        updates,
        { new: true }
      ).populate('exercises.exerciseId');

      if (!plan) {
        return res.status(404).json({ error: 'Workout plan not found' });
      }

      // Update workout sessions if necessary
      if (updates.exercises) {
        await this.updateWorkoutSessions(plan);
      }

      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteWorkoutPlan(req, res) {
    try {
      const { id } = req.params;
      
      // Delete plan and associated sessions
      await Promise.all([
        WorkoutPlan.findOneAndDelete({ _id: id, userId: req.user.id }),
        WorkoutSession.deleteMany({ workoutPlanId: id })
      ]);

      res.json({ message: 'Workout plan deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async generateWorkoutPlan(req, res) {
    try {
      const { currentFitness, goals, equipment } = req.body;

      const workoutPlan = await WorkoutGenerationService.createProgressiveWorkoutPlan(
        req.user.id,
        currentFitness,
        goals,
        equipment
      );

      const sessions = await this.createWorkoutSessions(workoutPlan);

      res.json({
        plan: workoutPlan,
        sessions
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async startWorkoutSession(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await WorkoutSession.findById(sessionId);

      if (!session) {
        return res.status(404).json({ error: 'Workout session not found' });
      }

      session.startTime = new Date();
      await session.save();

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateWorkoutProgress(req, res) {
    try {
      const { sessionId } = req.params;
      const { exerciseId, setNumber, reps, weight } = req.body;

      const session = await WorkoutSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Workout session not found' });
      }

      // Update exercise progress
      const exercise = session.exercises.find(e => 
        e.exerciseId.toString() === exerciseId
      );

      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found in session' });
      }

      exercise.actualReps[setNumber] = reps;
      exercise.actualWeight[setNumber] = weight;
      exercise.completedSets = exercise.actualReps.filter(r => r > 0).length;

      // Update session completion percentage
      session.completionPercentage = this.calculateSessionCompletion(session);
      await session.save();

      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async completeWorkoutSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { rating, notes } = req.body;

      const session = await WorkoutSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Workout session not found' });
      }

      session.endTime = new Date();
      session.isCompleted = true;
      session.userRating = rating;
      session.notes = notes;
      session.totalCaloriesBurned = await this.calculateTotalCaloriesBurned(session);

      await session.save();

      // Generate next workout recommendation
      const nextWorkout = await WorkoutGenerationService.generateCardioRecommendations(
        req.user.heartRateData,
        req.user.enduranceGoals
      );

      res.json({
        session,
        nextWorkout
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getWorkoutHistory(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const query = {
        userId: req.user.id,
        isCompleted: true
      };

      if (startDate) {
        query.scheduledDate = { $gte: new Date(startDate) };
      }
      if (endDate) {
        query.scheduledDate = { ...query.scheduledDate, $lte: new Date(endDate) };
      }

      const sessions = await WorkoutSession.find(query)
        .populate('workoutPlanId')
        .populate('exercises.exerciseId')
        .sort('-scheduledDate');

      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createWorkoutSessions(workoutPlan) {
    const sessions = [];
    const startDate = new Date();

    for (let week = 0; week < workoutPlan.durationWeeks; week++) {
      for (let day = 0; day < workoutPlan.workoutsPerWeek; day++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(startDate.getDate() + (week * 7) + day);

        const session = new WorkoutSession({
          userId: workoutPlan.userId,
          workoutPlanId: workoutPlan._id,
          scheduledDate: sessionDate,
          exercises: workoutPlan.exercises.map(exercise => ({
            exerciseId: exercise.exerciseId,
            plannedSets: exercise.sets,
            plannedReps: exercise.reps,
            plannedWeight: exercise.weight,
            plannedDuration: exercise.duration,
            actualReps: Array(exercise.sets).fill(0),
            actualWeight: Array(exercise.sets).fill(0)
          }))
        });

        sessions.push(await session.save());

        // Schedule notification
        await NotificationService.scheduleNotifications(
          session._id,
          'workout_reminder',
          sessionDate,
          'Your workout session is scheduled to start soon!'
        );
      }
    }

    return sessions;
  }

  static async updateWorkoutSessions(workoutPlan) {
    const sessions = await WorkoutSession.find({
      workoutPlanId: workoutPlan._id,
      startTime: null // Only update future sessions
    });

    for (const session of sessions) {
      session.exercises = workoutPlan.exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        plannedSets: exercise.sets,
        plannedReps: exercise.reps,
        plannedWeight: exercise.weight,
        plannedDuration: exercise.duration,
        actualReps: Array(exercise.sets).fill(0),
        actualWeight: Array(exercise.sets).fill(0)
      }));

      await session.save();
    }
  }

  static calculateSessionCompletion(session) {
    const totalSets = session.exercises.reduce((sum, exercise) => 
      sum + exercise.plannedSets, 0);
    
    const completedSets = session.exercises.reduce((sum, exercise) => 
      sum + exercise.completedSets, 0);

    return Math.round((completedSets / totalSets) * 100);
  }

  static async calculateTotalCaloriesBurned(session) {
    let totalCalories = 0;
    const workoutDuration = (session.endTime - session.startTime) / (1000 * 60); // in minutes

    for (const exercise of session.exercises) {
      const exerciseDetails = await Exercise.findById(exercise.exerciseId);
      if (exerciseDetails) {
        const exerciseDuration = exercise.actualDuration || 
          (exercise.completedSets * (exerciseDetails.avgTimePerSet || 1));
        
        totalCalories += exerciseDetails.caloriesPerMinute * exerciseDuration;
      }
    }

    return Math.round(totalCalories);
  }
}

module.exports = WorkoutController;
