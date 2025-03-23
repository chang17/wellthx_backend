const db = require('../config/dbConfig');

const getSettingValue = async () => {
    const [rows] = await db.execute("SELECT * FROM settings");
    return rows.length > 0 ? rows[0] : null;
};

const getSettingValueByKeyName = async (keyName) => {
    const [rows] = await db.execute("SELECT value FROM settings where key_name = ? ",[keyName]);
    return rows.length > 0 ? rows[0].value : null;
};
module.exports = { 
    getSettingValue,
    getSettingValueByKeyName 
};
