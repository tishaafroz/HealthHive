const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'general_fitness'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  durationWeeks: {
    type: Number,
    required: true,
    min: 1
  },
  workoutsPerWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  estimatedTimePerWorkout: {
    type: Number,
    required: true,
    min: 5
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: Number,
    reps: Number,
    duration: Number,
    restTime: Number,
    weight: Number,
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster querying
workoutPlanSchema.index({ userId: 1, isActive: 1 });
workoutPlanSchema.index({ userId: 1, goal: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
