const mongoose = require('mongoose');

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: Date,
  endTime: Date,
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    plannedSets: Number,
    completedSets: Number,
    plannedReps: Number,
    actualReps: [Number],
    plannedWeight: Number,
    actualWeight: [Number],
    plannedDuration: Number,
    actualDuration: Number,
    caloriesBurned: Number,
    notes: String
  }],
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String,
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for querying
workoutSessionSchema.index({ userId: 1, scheduledDate: 1 });
workoutSessionSchema.index({ userId: 1, isCompleted: 1 });

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
