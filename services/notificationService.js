const { sendNotification } = require('../websocket');
const { sendEmail } = require('./emailService');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

const createNotification = async (userId, message) => {
    await notificationRepository.addNotification(userId, message);
    sendNotification(userId, message);
    
    // Fetch user email and send email notification
    const user = await userRepository.getUserById(userId);
    if (user && user.email) {
        sendEmail(user.email, 'New Notification', message);
    }
};

const getUserNotifications = async (userId) => {
    return await notificationRepository.getNotificationsByUserId(userId);
};

const markNotificationAsRead = async (notificationId) => {
    return await notificationRepository.updateNotificationStatus(notificationId, 'read');
};

module.exports = { getUserNotifications, markNotificationAsRead, createNotification };