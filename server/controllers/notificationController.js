const Notification = require('../models/Notification');
const NotificationService = require('../services/NotificationService');

class NotificationController {
  static async getUserNotifications(req, res) {
    try {
      const notifications = await Notification.find({
        userId: req.user.id,
        isSent: true,
        scheduledTime: { $lte: new Date() }
      }).sort('-scheduledTime');

      res.json(notifications);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await NotificationService.markNotificationAsRead(id);

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updatePreferences(req, res) {
    try {
      const { preferences } = req.body;
      
      // Update user notification preferences
      const user = await req.user.updateOne({
        notificationPreferences: preferences
      });

      // Update scheduled notifications based on new preferences
      await this.updateScheduledNotifications(req.user.id, preferences);

      res.json({ message: 'Notification preferences updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.findOneAndDelete({
        _id: id,
        userId: req.user.id
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const count = await Notification.countDocuments({
        userId: req.user.id,
        isRead: false,
        isSent: true
      });

      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async clearAllNotifications(req, res) {
    try {
      await Notification.deleteMany({
        userId: req.user.id,
        isSent: true
      });

      res.json({ message: 'All notifications cleared successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateScheduledNotifications(userId, preferences) {
    const notifications = await Notification.find({
      userId,
      isSent: false
    });

    for (const notification of notifications) {
      const preferenceType = this.getNotificationPreferenceType(notification.notificationType);
      if (!preferences[preferenceType].enabled) {
        await Notification.findByIdAndDelete(notification._id);
        continue;
      }

      // Adjust timing based on new preferences
      const adjustedTime = this.adjustNotificationTime(
        notification.scheduledTime,
        preferences[preferenceType].timing
      );

      await Notification.findByIdAndUpdate(notification._id, {
        scheduledTime: adjustedTime
      });
    }
  }

  static getNotificationPreferenceType(notificationType) {
    const typeMap = {
      meal_reminder: 'mealReminders',
      workout_reminder: 'workoutReminders',
      progress_update: 'progressUpdates',
      goal_achieved: 'achievements'
    };

    return typeMap[notificationType] || 'general';
  }

  static adjustNotificationTime(originalTime, timing) {
    const time = new Date(originalTime);
    
    switch (timing) {
      case 'exact':
        return time;
      case '5min':
        time.setMinutes(time.getMinutes() - 5);
        break;
      case '15min':
        time.setMinutes(time.getMinutes() - 15);
        break;
      case '30min':
        time.setMinutes(time.getMinutes() - 30);
        break;
      case '1hour':
        time.setHours(time.getHours() - 1);
        break;
    }

    return time;
  }
}

module.exports = NotificationController;
