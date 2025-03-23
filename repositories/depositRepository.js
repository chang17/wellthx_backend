const db = require("../config/dbConfig");

const getPendingDeposits = async () => {
    const query = `SELECT * FROM deposit_transactions WHERE status = 'pending'`;
    const [rows] = await db.query(query);
    return rows;
};

const markDepositCompleted = async (transactionId) => {
    const query = `UPDATE deposit_transactions SET status = 'completed' WHERE transaction_id = ?`;
    await db.execute(query, [transactionId]);
};

module.exports = { getPendingDeposits, markDepositCompleted };
