const pool = require('../config/dbConfig');

const createUser = async (user) => {
    const { username, email, password_hash, role } = user;
    const sql = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(sql, [username, email, password_hash, role]);
    return result;
};

module.exports = { createUser };