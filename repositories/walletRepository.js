const pool = require('../config/dbConfig');

const getBalanceByUserId = async (userId) => {
    const [rows] = await pool.execute('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
    return rows.length ? rows[0].balance : 0;
};

module.exports = { getBalanceByUserId };