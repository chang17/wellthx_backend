const db = require("../config/dbConfig");

const withdrawalRepository = {
    async createWithdrawal(memberId, publicAddress, amount) {
        try{
            const query = `
                INSERT INTO withdrawal_transactions (member_id, public_address, amount, history, status)
                VALUES (?, ?, ?, true, 'pending')
            `;
            const [result] = await db.query(query, [memberId, publicAddress, amount]);
            return result.insertId;
        } catch (err) {
            console.error("Error creating withdrawal transaction:", err);
            throw new Error("Failed to create withdrawal transaction");
        }
    },

    async getWithdrawalById(withdrawalId) {
        const query = "SELECT * FROM withdrawal_transactions WHERE withdrawal_id = ?";
        const [rows] = await db.query(query, [withdrawalId]);
        return rows[0];
    },

    async getWithdrawalsByMember(memberId) {
        console.log("getWithdrawalsByMember : ", memberId); 
        const query = "SELECT * FROM withdrawal_transactions WHERE member_id = ? and status = 'pending'";
        const [rows] = await db.query(query, [memberId]);
        console.log("rows : " , rows); 
        return rows;
    },

    async updateWithdrawalStatus(withdrawalId, status) {
        try{
            const query = "UPDATE withdrawal_transactions SET status = ?, history = true , updated_at = NOW() WHERE withdrawal_id = ?";
            const [result] = await db.query(query, [status, withdrawalId]);
            console.log("result : " , result);
            console.log("row ? : " , result.affectedRows);
            if (result.affectedRows === 1) {
                console.log(`✅ Successfully update withdrawal status.`);
                return true;
            } else {
                console.log(`❌ Failed to update withdrawal status.`);
                throw new Error(`❌ Failed to update withdrawal status.`);
            }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to update withdrawal status. Database error: ${e.message}`);
    }
    },

    async getPendingWithdrawals() {
        const query = "SELECT * FROM withdrawal_transactions WHERE status = 'pending'";
        const [rows] = await db.query(query);
        return rows;
    },

    async cancelWithdrawal(withdrawalId, memberId) {
        const query = `
            UPDATE withdrawal_transactions 
            SET status = 'cancel', updated_at = NOW()  
            WHERE withdrawal_id = ? AND member_id = ? AND status = 'pending'
        `;
        await db.query(query, [withdrawalId, memberId]);
        return true;
    },

    async getWithdrawalHistory(memberId) {
        const query = "SELECT * FROM withdrawal_transactions WHERE member_id = ? and history = true ORDER BY processed_at DESC";
        const [rows] = await db.query(query, [memberId]);
        return rows;
    },
};

module.exports = withdrawalRepository;
