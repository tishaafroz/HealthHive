const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  metrics: {
    weightChange: Number,
    caloriesConsumed: Number,
    caloriesBurned: Number,
    workoutsCompleted: Number,
    mealsCompleted: Number,
    averageBMI: Number,
    goalProgress: Number
  },
  trends: {
    weightTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    },
    activityTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    },
    complianceTrend: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable']
    }
  },
  achievements: [{
    type: {
      type: String,
      enum: ['milestone', 'streak', 'improvement']
    },
    title: String,
    description: String,
    unlockedAt: Date,
    iconUrl: String
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for querying
analyticsSchema.index({ userId: 1, period: 1, startDate: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
