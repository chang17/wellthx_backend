const db = require('../config/dbConfig');

const getReferralsByUserId = async (userId) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE referrer_id = ?', [userId]);
    return rows;
};

module.exports = { getReferralsByUserId };