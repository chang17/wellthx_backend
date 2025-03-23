const db = require('../config/dbConfig');

const getAllUsers = async () => {
    const [rows] = await db.execute('SELECT id, username, email, status, role FROM users');
    return rows;
};

const updateUserStatus = async (userId, status) => {
    return await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
};

const getAllTransactions = async () => {
    const [rows] = await db.execute('SELECT * FROM transactions ORDER BY created_at DESC');
    return rows;
};

const getPendingDeposits = async () => {
    const query = `SELECT * FROM deposit_transactions WHERE status = 'pending'`;
    const [rows] = await db.query(query);
    return rows;
};

const markDepositCompleted = async (transactionId) => {
    const query = `UPDATE deposit_transactions SET status = 'completed' WHERE transaction_id = ?`;
    await db.execute(query, [transactionId]);
};




module.exports = { 
    getAllUsers, 
    updateUserStatus, 
    getAllTransactions,
    getPendingDeposits, 
    markDepositCompleted,
 };
