const mongoose = require('mongoose');

const mealScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  mealName: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  ingredients: [{
    type: String
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  notes: String,
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'weekdays'],
      default: 'daily'
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }]
  }
}, {
  timestamps: true
});

// Index for faster queries by userId and scheduledTime
mealScheduleSchema.index({ userId: 1, scheduledTime: 1 });

module.exports = mongoose.model('MealSchedule', mealScheduleSchema);
