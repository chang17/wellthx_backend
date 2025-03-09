const pool = require('../config/dbConfig');

const getReferralsByUserId = async (userId) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE referrer_id = ?', [userId]);
    return rows;
};

module.exports = { getReferralsByUserId };