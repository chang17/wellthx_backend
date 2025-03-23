const db = require('../config/dbConfig'); // Assume MySQL connection setup

class RedeemRepository {
    async createRedeemTransaction(redeemData, connection) { 
        try {
            const query = `
                INSERT INTO redeem_transactions 
                (member_id, product_id, total_units, amount, recipient_name, address, state, postcode, country, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
            const [result] = await connection.execute(query, [
                redeemData.member_id, 
                redeemData.product_id, 
                redeemData.total_units, 
                redeemData.amount, 
                redeemData.recipient_name, 
                redeemData.address, 
                redeemData.state, 
                redeemData.postcode, 
                redeemData.country, 
                redeemData.status
            ]);
    
            return result.insertId;
        } catch (err) {
            console.error("Error creating redeem transaction:", err);
            throw new Error("Failed to create redeem transaction");
        }
    }
    

    async getRedemptionById(redeemId) {
        const query = `SELECT * FROM redeem_transactions WHERE id = ?`;
        const [rows] = await db.execute(query, [redeemId]);
        return rows[0];
    }

    async updateRedemptionStatus(redeemId, status, connection) {
        try{
            if (!connection) {
                const query = `UPDATE redeem_transactions SET status = ? WHERE id = ?`;
                await db.execute(query, [status, redeemId]);
            } else {
                const query = `UPDATE redeem_transactions SET status = ? WHERE id = ?`;
                await connection.execute(query, [status, redeemId]);
            }
        } catch (err) {
            console.error("Error updating redemption status:", err);
            throw new Error("Failed to update redemption status");
        } 
    }
        

    async updateConfirmLogistics(redeemId, logisticCompany, trackingNumber, confirmedDate ) {
        const query = `UPDATE redeem_transactions SET logistic_company = ?, tracking_number = ?, confirmed_at = ?, status = 'confirmed' WHERE id = ?`;
        await db.execute(query, [logisticCompany, trackingNumber, confirmedDate,redeemId]);
    }

    async updateDeliverLogistics(redeemId, deliveredDate ) {
        const query = `UPDATE redeem_transactions SET delivered_at = ?, status = 'delivered' WHERE id = ?`;
        await db.execute(query, [deliveredDate,redeemId]);
    }

    async getRedemptionList(status) {
        let query = `SELECT * FROM redeem_transactions`;
        let params = [];
    
        if (status) {
            query += ` WHERE status = ?`;
            params.push(status);
        }
    
        const [rows] = await db.execute(query, params);
        return rows;
    }

    async getRedemptionByMemberId(memberId) {
        try{
            if (!memberId) {
                throw new Error("Member ID is required");
            }
            const query = `SELECT * FROM redeem_transactions WHERE member_id =? ORDER BY created_at DESC`;
            const [rows] = await db.execute(query, [memberId]);
            return rows;
        } catch (e) {
            console.error("Error retrieving redemptions by member ID:", e);
            throw new Error("Failed to retrieve redemptions by member ID");
        }
        
    }
    
}



module.exports = new RedeemRepository();
