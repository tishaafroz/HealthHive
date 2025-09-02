const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealSchedule'
  },
  notificationType: {
    type: String,
    enum: ['meal_reminder', 'meal_overdue', 'workout_reminder', 'goal_achieved', 'progress_update'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isSent: {
    type: Boolean,
    default: false
  },
  sentAt: Date
}, {
  timestamps: true
});

// Indexes for faster queries
notificationSchema.index({ userId: 1, scheduledTime: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
