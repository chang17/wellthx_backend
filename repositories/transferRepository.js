

/**
 * Check if two members have a direct sponsor relationship (either as upline or downline).
 * Transfers are allowed if:
 * - Sender is in the receiver's sponsor tree (downline)
 * - Receiver is in the sender's sponsor tree (upline)
 *
 * @param {number} senderId - The ID of the sender
 * @param {number} receiverId - The ID of the receiver
 * @returns {Promise<boolean>} - True if transfer is allowed, otherwise false
 */
const checkDirectRelationship = async (senderId, receiverId, connection) => {
    try {
        // Query #1: Is receiverId in senderId’s sponsor tree?
        const downlineQuery = `
            WITH RECURSIVE sponsor_tree AS (
                SELECT id, sponsor_id 
                FROM members 
                WHERE id = ?
                UNION ALL
                SELECT m.id, m.sponsor_id 
                FROM members m
                INNER JOIN sponsor_tree s ON m.sponsor_id = s.id
            )
            SELECT COUNT(*) AS count 
            FROM sponsor_tree 
            WHERE id = ?;
        `;

        // Query #2: Is senderId in receiverId’s sponsor tree? (for upline check)
        const uplineQuery = `
            WITH RECURSIVE sponsor_tree AS (
                SELECT id, sponsor_id 
                FROM members 
                WHERE id = ?
                UNION ALL
                SELECT m.id, m.sponsor_id 
                FROM members m
                INNER JOIN sponsor_tree s ON m.sponsor_id = s.id
            )
            SELECT COUNT(*) AS count 
            FROM sponsor_tree 
            WHERE id = ?;
        `;

        // Execute both queries
        const [[downlineResult], [uplineResult]] = await Promise.all([
            connection.query(downlineQuery, [senderId, receiverId]),
            connection.query(uplineQuery, [receiverId, senderId])
        ]);

        const isDownline = downlineResult[0].count > 0; 
        const isUpline = uplineResult[0].count > 0;  

        // Transfer allowed if either condition is true
        return isDownline || isUpline;

    } catch (error) {
        console.error("Error in checkDirectRelationship:", error);
        throw new Error("Database query error");
    }
};







const getWalletBalance = async (memberId, walletTypeId, connection) => {
    const query = `SELECT wallet_id, balance FROM wallets WHERE member_id = ? AND wallet_type_id = ?`;
    const [rows] = await connection.query(query, [memberId, walletTypeId]);
    return rows.length > 0 ? rows[0] : null;
};

const createWallet = async (memberId, walletTypeId, connection) => {
    const query = `INSERT INTO wallets (member_id, wallet_type_id, balance, created_at) VALUES (?, ?, 0, NOW())`;
    await connection.query(query, [memberId, walletTypeId]);
    return getWalletBalance(memberId, walletTypeId, connection);
};

const updateWalletBalance = async (memberId, walletTypeId, amount, connection) => {
    const query = `UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE member_id = ? AND wallet_type_id = ?`;
    await connection.query(query, [amount, memberId, walletTypeId]);
};


module.exports = {
    checkDirectRelationship,
    getWalletBalance,
    createWallet,
    updateWalletBalance
};
