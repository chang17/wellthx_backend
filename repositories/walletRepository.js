const db = require('../config/dbConfig');

const getBalanceByUserId = async (userId) => {
    const [rows] = await db.execute('SELECT balance FROM wallets WHERE member_id = ?', [userId]);
    return rows.length ? rows[0].balance : 0;
};

 /**
  * Update wallet balance (increment or decrement)
  * @param {number} memberId
  * @param {number} walletTypeId
  * @param {number} amount
  * @param {string} type - "CREDIT" or "DEBIT"
  * @returns {Promise<boolean>}
  */
 const updateWalletBalance = async (walletId, newBalance, connection) => {
    const query = `UPDATE wallets SET balance = ? WHERE wallet_id = ?`;
    await connection.query(query, [newBalance, walletId]);
};

/*
const createWallet = async (memberId, username, walletTypes, connection) => {
    console.log(`createWallet : ` + memberId + ',' + username + ',' + walletTypes);
    const values = walletTypes.map(typeId => 
        `(${memberId}, '${username}', ${typeId}, 0)`
    ).join(", ");

    const query = `INSERT INTO wallets (member_id, username, wallet_type_id, balance) VALUES ${values}`;
    await connection.query(query);
};
*/
const createWallet = async (memberId, username, walletTypes, connection) => {
    console.log(`createWallet : ` + memberId + ',' + username + ',' + walletTypes);
    
    // Map wallet types and set balance conditionally
    const values = walletTypes.map(typeId => {
        const balance = typeId === 6 ? 150 : 0; // Check if wallet_type_id is 6
        return `(${memberId}, '${username}', ${typeId}, ${balance})`;
    }).join(", ");

    const query = `INSERT INTO wallets (member_id, username, wallet_type_id, balance) VALUES ${values}`;
    await connection.query(query);
};


const getWalletsByMemberId = async (memberId, connection) => {
    const query = `SELECT wallet_id, wallet_type_id, balance FROM wallets WHERE member_id = ?`;
    const [rows] = await connection.query(query, [memberId]);
    return rows;
};

const getUSDTWalletsByMemberId = async (memberId) => {
    const query = `SELECT wallet_id, wallet_type_id, balance FROM wallets WHERE member_id = ? and wallet_type_id = 1`;
    const [rows] = await db.query(query, [memberId]);
    return rows;
};

const getShoppingWalletsByMemberId = async (memberId) => {
    const query = `SELECT wallet_id, wallet_type_id, balance FROM wallets WHERE member_id = ? and wallet_type_id = 3`;
    const [rows] = await db.query(query, [memberId]);
    return rows.length > 0 ? rows[0] : null;
};

const getActivationWalletsByMemberId = async (memberId) => {
    const query = `SELECT wallet_id, wallet_type_id, balance FROM wallets WHERE member_id = ? and wallet_type_id = 2`;
    const [rows] = await db.query(query, [memberId]);
    return rows.length > 0 ? rows[0] : null;
};
const getRebateWalletsByMemberId = async (memberId) => {
    const query = `SELECT wallet_id, wallet_type_id, balance FROM wallets WHERE member_id = ? and wallet_type_id = 4`;
    const [rows] = await db.query(query, [memberId]);
    return rows.length > 0 ? rows[0] : null;
};
const getWalletByMemberAndType = async (memberId, walletTypeId, connection) => {
    try {
        const query = `
            SELECT * FROM wallets 
            WHERE member_id = ? AND wallet_type_id = ? 
            LIMIT 1;
        `;
        const [rows] = await connection.query(query, [memberId, walletTypeId]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error fetching wallet by member and type:", error);
        throw error;
    }
};

async function creditUSDTWallet(memberId, amount) {
    try{
        const query = `UPDATE wallets SET balance = balance + ?, updated_at = NOW()  WHERE member_id = ? AND wallet_type_id = 1`;
        const [result] = await db.query(query, [amount, memberId]);
        if (result.affectedRows === 1) {
            console.log(`✅ Successfully to credit ${amount} to USDT Wallet.`);
            return true;
        } else {
            console.log(`❌ Failed to create ${amount} to USDT Wallet.`);
            throw new Error(`❌ Failed to create ${amount} to USDT Wallet.`);
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to credit ${amount} to  USDT Wallet. Database error: ${e.message}`);
    }
    
}

async function debitUSDTWallet(memberId, amount) {
    try{
        const query = `UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE member_id = ? AND wallet_type_id = 1`;
        const [result] = await db.query(query, [amount, memberId]);
        if (result.affectedRows === 1) {
            console.log(`✅ Successfully to debit ${amount} from USDT Wallet.`);
            return true;
        } else {
            console.log(`❌ Failed to debit ${amount} from USDT Wallet.`);
            throw new Error(`❌ Failed to debit ${amount} from USDT Wallet.`);
        }    
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to debit ${amount} from USDT Wallet. Database error: ${e.message}`);
    }
}
const creditWallet = async (memberId, walletTypeId, amount, connection) => {
    try {
        console.log("creditWallet : " + memberId +" , " + walletTypeId + " , " + amount)
        // Ensure the wallet exists
        const [wallet] = await connection.query(
            "SELECT wallet_id, balance FROM wallets WHERE member_id = ? AND wallet_type_id = ?",
            [memberId, walletTypeId]
        );

        if (!wallet.length) {
            throw new Error(`Wallet type ${walletTypeId} not found for member ID ${memberId}.`);
        }

        // Update wallet balance
        const updateWalletQuery = `
            UPDATE wallets 
            SET balance = balance + ?, updated_at = NOW() 
            WHERE member_id = ? AND wallet_type_id = ?`;
        
        const [result] = await connection.query(updateWalletQuery, [amount, memberId, walletTypeId]);

        // Ensure the update was successful
        if (result.affectedRows === 0) {
            throw new Error(`Failed to update wallet for member ID ${memberId}, wallet type ${walletTypeId}.`);
        }

        return { success: true, message: "Wallet credited successfully." };
    } catch (error) {
        console.error("Error in creditWallet:", error.message);
        throw error; // Let service handle transaction rollback
    }
};

async function debitWallet(memberId, walletType, amount, connection) {
    try{
        const query = `UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE member_id = ? AND wallet_type_id = ?`;
        const [result] = await connection.query(query, [amount, memberId, walletType]);
        if (result.affectedRows === 1) {
            console.log(`✅ Successfully to debit ${amount} from wallet ${walletType}.`);
            return true;
        } else {
            console.log(`❌ Failed to debit ${amount} from wallet ${walletType}.`);
            throw new Error(`❌ Failed to debit ${amount} from wallet ${walletType}.`);
        }    
    } catch (e) {
        console.error("�� Database error:", e);
        await connection.rollback();
        throw new Error(`�� Failed to debit ${amount} from wallet ${walletType}. Database error: ${e.message}`);
    } finally {
        connection.release();
    }
    
}

async function getRedemptionList(status) {
    let query = `SELECT * FROM redeem_transactions`;
    let params = [];

    if (status) {
        query += ` WHERE status = ?`;
        params.push(status);
    }

    const [rows] = await db.execute(query, params);
    return rows;
}


module.exports = { 
    getBalanceByUserId, 
    getWalletsByMemberId, 
    updateWalletBalance, 
    createWallet,
    getWalletsByMemberId,
    creditWallet,
    getWalletByMemberAndType,
    getUSDTWalletsByMemberId,
    debitUSDTWallet,
    creditUSDTWallet,
    getShoppingWalletsByMemberId,
    debitWallet,
    getRedemptionList,
    getActivationWalletsByMemberId,
    getRebateWalletsByMemberId
 };