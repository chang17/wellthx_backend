const pool = require('../config/dbConfig');

const addPendingBonus = async (userId, bonusType, amount) => {
    return await pool.execute('INSERT INTO bonuses (user_id, bonus_type, amount, status) VALUES (?, ?, ?, ?)', [userId, bonusType, amount, 'pending']);
};

const getPendingBonuses = async () => {
    const [rows] = await pool.execute("SELECT * FROM bonuses WHERE status = 'pending'");
    return rows;
};

const updateBonusStatus = async (bonusId, status, remark = null) => {
    return await pool.execute("UPDATE bonuses SET status = ?, remark = ? WHERE id = ?", [status, remark, bonusId]);
};

module.exports = { addPendingBonus, getPendingBonuses, updateBonusStatus };

// Example: Wallet Repository Update
// src/repositories/walletRepository.js
const updateWalletBalance = async (userId, amount) => {
    return await pool.execute("UPDATE wallets SET balance = balance + ? WHERE user_id = ?", [amount, userId]);
};

const getUserBonuses = async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM bonuses WHERE user_id = ?', [userId]);
    return rows;
};

module.exports = { updateWalletBalance, getUserBonuses };