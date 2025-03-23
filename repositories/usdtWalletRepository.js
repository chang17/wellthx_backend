const db = require("../config/dbConfig");

async function createWalletAddress(memberId, publicAddress, privateAddress, connection) {
    const checkQuery = `SELECT COUNT(*) AS count FROM usdt_wallet_addresses WHERE member_id = ?`;
    const [rows] = await db.execute(checkQuery, [memberId]);

    if (rows[0].count > 0) {
        console.log(`Wallet address already exists for memberId: ${memberId}. Skipping creation.`);
        return { code: "S002", message: "Wallet address already exists." };
    }

    const insertQuery = `
        INSERT INTO usdt_wallet_addresses (member_id, public_address, private_address, created_at)
        VALUES (?, ?, ?, NOW())
    `;
    await connection.execute(insertQuery, [memberId, publicAddress, privateAddress]);

    console.log(`Wallet address created for memberId: ${memberId}.`);
    return { code: "S001", message: "Wallet address created successfully." };
}


const getWalletPrivateKey = async (publicAddress) => {
    const query = `SELECT private_address FROM usdt_wallet_addresses WHERE public_address = ?`;
    const [rows] = await db.query(query, [publicAddress]);
    return rows.length ? rows[0].private_address : null;
};

const updateUserWalletBalance = async (memberId, amount) => {
    const query = `UPDATE wallets SET balance = balance + ? WHERE member_id = ? AND wallet_type_id = 1`;
    await db.execute(query, [amount, memberId]);
};


module.exports = { createWalletAddress, getWalletPrivateKey, updateUserWalletBalance };
