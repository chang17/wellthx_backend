const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await notificationService.markNotificationAsRead(req.params.id);
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getNotifications, markAsRead };
