const db = require('../config/dbConfig');

const getNotificationsByUserId = async (userId) => {
    const [rows] = await db.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
};

const updateNotificationStatus = async (notificationId, status) => {
    return await db.execute('UPDATE notifications SET status = ? WHERE id = ?', [status, notificationId]);
};

module.exports = { getNotificationsByUserId, updateNotificationStatus };
