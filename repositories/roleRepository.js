const db = require('../config/dbConfig');

const getRoleById = async (role_id) => {
    const [rows] = await db.execute("SELECT role_name FROM roles WHERE id = ?", [role_id]);
    return rows.length > 0 ? rows[0] : null;
};

module.exports = { getRoleById };
