const pool = require('../config/dbConfig');

const getDirectSponsors = async (userId, limit = 3) => {
    const [rows] = await pool.execute(
        `SELECT id, username, fullname, email FROM members WHERE sponsor_id = ? LIMIT ?`,
        [userId, limit]
    );
    return rows;
};

const hasSubMembers = async (memberId) => {
    const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM members WHERE sponsor_id = ?`,
        [memberId]
    );
    return rows[0].count > 0;
};

module.exports = { getDirectSponsors, hasSubMembers };
