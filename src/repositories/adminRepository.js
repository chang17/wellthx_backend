const pool = require('../config/dbConfig');

const getAllUsers = async () => {
    const [rows] = await pool.execute('SELECT id, username, email, status, role FROM users');
    return rows;
};

const updateUserStatus = async (userId, status) => {
    return await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
};

const getAllTransactions = async () => {
    const [rows] = await pool.execute('SELECT * FROM transactions ORDER BY created_at DESC');
    return rows;
};

module.exports = { getAllUsers, updateUserStatus, getAllTransactions };
