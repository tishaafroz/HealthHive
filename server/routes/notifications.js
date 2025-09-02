const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get user notifications
router.get('/', auth, notificationController.getUserNotifications);

// Mark notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Update notification preferences
router.post('/preferences', auth, notificationController.updatePreferences);

// Delete notification
router.delete('/:id', auth, notificationController.deleteNotification);

// Get unread notification count
router.get('/unread/count', auth, notificationController.getUnreadCount);

// Clear all notifications
router.delete('/clear/all', auth, notificationController.clearAllNotifications);

module.exports = router;
