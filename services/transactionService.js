const { sendNotification } = require('../websocket');
const notificationRepository = require('../repositories/notificationRepository');

const createNotification = async (userId, message) => {
    await notificationRepository.addNotification(userId, message);
    sendNotification(userId, message);
};

module.exports = { createNotification };