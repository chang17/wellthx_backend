const db = require('../config/dbConfig');

// Fetch package details (shopping points & sub-accounts count)
const getPackageById = async (packageId) => {
    const query = "SELECT * FROM packages WHERE id = ?";
    const [rows] = await db.execute(query, [packageId]);
    return rows.length > 0 ? rows[0] : null;
}

// Fetch rebate points configuration
const getRebatePointsConfig = async (packageId) => {
    const query = `SELECT points_per_account, total_points FROM rebate_points_config WHERE package_id = ?`;
    const [rows] = await db.query(query, [packageId]);
    return rows.length ? rows[0] : null;
};
module.exports = {
    getPackageById,
    getRebatePointsConfig,
};
