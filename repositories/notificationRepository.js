const pool = require('../config/dbConfig');

const getNotificationsByUserId = async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
};

const updateNotificationStatus = async (notificationId, status) => {
    return await pool.execute('UPDATE notifications SET status = ? WHERE id = ?', [status, notificationId]);
};

module.exports = { getNotificationsByUserId, updateNotificationStatus };
