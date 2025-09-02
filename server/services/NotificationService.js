const Notification = require('../models/Notification');
const MealSchedule = require('../models/MealSchedule');
const WorkoutSession = require('../models/WorkoutSession');

class NotificationService {
  static async scheduleNotifications(entityId, type, scheduledTime, message) {
    let notification;
    
    switch (type) {
      case 'meal_reminder':
        notification = await this.createMealNotification(entityId, scheduledTime);
        break;
      case 'workout_reminder':
        notification = await this.createWorkoutNotification(entityId, scheduledTime);
        break;
      default:
        notification = await this.createCustomNotification(entityId, type, scheduledTime, message);
    }

    return notification;
  }

  static async createMealNotification(mealScheduleId, scheduledTime) {
    const meal = await MealSchedule.findById(mealScheduleId);
    if (!meal) throw new Error('Meal schedule not found');

    const reminderTime = new Date(scheduledTime.getTime() - 30 * 60000); // 30 minutes before
    
    const notification = new Notification({
      userId: meal.userId,
      mealScheduleId: meal._id,
      notificationType: 'meal_reminder',
      scheduledTime: reminderTime,
      message: `Time to prepare ${meal.mealName} for ${meal.mealType}!`,
    });

    return await notification.save();
  }

  static async createWorkoutNotification(workoutSessionId, scheduledTime) {
    const workout = await WorkoutSession.findById(workoutSessionId);
    if (!workout) throw new Error('Workout session not found');

    const reminderTime = new Date(scheduledTime.getTime() - 15 * 60000); // 15 minutes before
    
    const notification = new Notification({
      userId: workout.userId,
      notificationType: 'workout_reminder',
      scheduledTime: reminderTime,
      message: 'Your workout session is starting soon!',
    });

    return await notification.save();
  }

  static async createCustomNotification(userId, type, scheduledTime, message) {
    const notification = new Notification({
      userId,
      notificationType: type,
      scheduledTime,
      message,
    });

    return await notification.save();
  }

  static async getPendingNotifications(userId) {
    const now = new Date();
    return await Notification.find({
      userId,
      scheduledTime: { $lte: now },
      isSent: false
    }).sort('scheduledTime');
  }

  static async markNotificationAsSent(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    notification.isSent = true;
    notification.sentAt = new Date();
    return await notification.save();
  }

  static async markNotificationAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    notification.isRead = true;
    return await notification.save();
  }

  static async deleteOldNotifications(userId, daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await Notification.deleteMany({
      userId,
      scheduledTime: { $lt: cutoffDate }
    });
  }
}

module.exports = NotificationService;
