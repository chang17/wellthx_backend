/**
 * Key Features
 * ✅ Supports DEBIT & CREDIT transactions.
 * ✅ Uses transactions to maintain consistency.
 * ✅ Easily extendable for future needs.
 */
const db = require('../config/dbConfig');


/**
 * Create a new transaction record
 * @param {number} memberId - ID of the member
 * @param {string} type - Transaction type ("CREDIT" or "DEBIT")
 * @param {number} walletTypeId - ID of the wallet type (1 = USDT, 2 = Shopping Points, 3 = Rebate Points, etc.)
 * @param {number} amount - Amount of the transaction
 * @param {string} description - Description of the transaction
 * @param {object} transaction - Database transaction object (optional)
 * @returns {Promise<object>} - Created transaction record
 */
const createTransaction = async (memberId, type, category, walletTypeId, amount, description, connection) => {
    console.log('createTransaction : ', memberId, type, category, walletTypeId, amount, description);
    const query = `
        INSERT INTO transactions (member_id, transaction_type, transaction_category, wallet_type_id, amount, description) 
        VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await connection.query(query, [memberId, type, category, walletTypeId, amount, description]);
    if (result.affectedRows === 1) {
        console.log(`✅ Successfully ${type} ${amount} from/to wallet ${walletTypeId}.`);
    } else {
        console.error(`❌ Failed ${type}  ${amount} from/to wallet ${walletTypeId}.`);
    }  
};

const insertTransaction = async (memberId, type, category, walletTypeId, amount, description) => {
    console.log('insertTransaction : ', memberId, type, category, walletTypeId, amount, description);
    const query = `
        INSERT INTO transactions (member_id, transaction_type, transaction_category, wallet_type_id, amount, description) 
        VALUES (?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [memberId, type, category, walletTypeId, amount, description]);
        if (result.affectedRows === 1) {
            console.log(`✅ Successfully ${type} ${amount} from/to wallet ${walletTypeId}.`);
        } else {
            console.error(`❌ Failed ${type}  ${amount} from/to wallet ${walletTypeId}.`);
        }    
};

/**
 * Retrieve transactions for a specific member
 * @param {number} memberId - ID of the member
 * @returns {Promise<object[]>} - List of transactions
 */
const getTransactionsByMemberId = async (memberId) => {
    const query = `SELECT * FROM transactions WHERE member_id = ? ORDER BY created_at DESC`;
    const [rows] = await db.query(query, [memberId]);
    return rows;
};

/**
 * Retrieve transaction details by ID
 * @param {number} transactionId - ID of the transaction
 * @returns {Promise<object>} - Transaction details
 */
const getTransactionById = async (transactionId) => {
    const query = `SELECT * FROM transactions WHERE id = ?`;
    const [rows] = await db.query(query, [transactionId]);
    return rows.length ? rows[0] : null;
};

const addTransaction = async (member_id, amount, type) => {
    return await db("transactions").insert({
        member_id,
        amount,
        type,
        status: "completed",
        created_at: new Date(),
    });
}

module.exports = {
    createTransaction,
    insertTransaction,
    getTransactionsByMemberId,
    getTransactionById,
    addTransaction, 
};
