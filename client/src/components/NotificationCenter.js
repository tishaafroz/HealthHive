import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Bell, Check, Trash2 } from 'react-feather';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    mealReminders: {
      enabled: true,
      timing: '30min'
    },
    workoutReminders: {
      enabled: true,
      timing: '15min'
    },
    progressUpdates: {
      enabled: true,
      timing: 'daily'
    },
    achievements: {
      enabled: true,
      timing: 'instant'
    }
  });

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notificationsRes, countRes] = await Promise.all([
        axios.get('/api/notifications'),
        axios.get('/api/notifications/unread/count')
      ]);

      setNotifications(notificationsRes.data);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification => 
        notification._id === notificationId
          ? { ...notification, isRead: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (!notifications.find(n => n._id === notificationId).isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete('/api/notifications/clear/all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handlePreferenceChange = async (category, field, value) => {
    try {
      const newPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [field]: value
        }
      };

      setPreferences(newPreferences);
      await axios.post('/api/notifications/preferences', {
        preferences: newPreferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'meal_reminder':
        return '🍽️';
      case 'workout_reminder':
        return '💪';
      case 'goal_achieved':
        return '🎯';
      case 'progress_update':
        return '📈';
      default:
        return '📬';
    }
  };

  return (
    <div className="notification-center">
      <div className="notification-header">
        <div className="notification-title">
          <Bell size={20} />
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <button onClick={() => setShowPreferences(!showPreferences)}>
          Preferences
        </button>
      </div>

      {showPreferences && (
        <div className="notification-preferences">
          <h4>Notification Preferences</h4>
          {Object.entries(preferences).map(([category, settings]) => (
            <div key={category} className="preference-group">
              <h5>{category.replace(/([A-Z])/g, ' $1').trim()}</h5>
              <div className="preference-controls">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => handlePreferenceChange(
                      category,
                      'enabled',
                      e.target.checked
                    )}
                  />
                  Enable
                </label>

                <select
                  value={settings.timing}
                  onChange={(e) => handlePreferenceChange(
                    category,
                    'timing',
                    e.target.value
                  )}
                  disabled={!settings.enabled}
                >
                  <option value="instant">Instant</option>
                  <option value="5min">5 minutes before</option>
                  <option value="15min">15 minutes before</option>
                  <option value="30min">30 minutes before</option>
                  <option value="1hour">1 hour before</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="notifications-list">
        {notifications.length > 0 ? (
          <>
            <div className="notifications-actions">
              <button onClick={handleClearAll}>Clear All</button>
            </div>
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.notificationType)}
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <small>
                    {format(new Date(notification.scheduledTime), 'MMM d, h:mm a')}
                  </small>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="action-button"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    className="action-button"
                    onClick={() => handleDeleteNotification(notification._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="no-notifications">No notifications</p>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
