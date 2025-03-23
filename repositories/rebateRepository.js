const walletRepository = require('../repositories/walletRepository');
const db = require('../config/dbConfig');

const logRebateCredit = async (memberId, userId, totalRebate, dailyCredit, connection) => {
    try {
        // Fetch the rebate wallet ID for the given member
        const rebateWallet = await walletRepository.getRebateWalletsByMemberId(memberId);
        if (!rebateWallet) throw new Error(`Rebate wallet not found for member ${memberId}`);

        // Insert record into `rebate_point_schedule`
        const sql = `
            INSERT INTO rebate_point_schedule (member_id, user_id, wallet_id, total_rebate, remaining_rebate, daily_credit)
            VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [memberId, userId, rebateWallet.wallet_id, totalRebate, totalRebate, dailyCredit];

        const [result] = await connection.query(sql, values);
        if (result.affectedRows === 1) {
            // Log transaction for debugging and audits
            console.log(`✅ Rebate schedule created for memberId: ${memberId}, walletId: ${rebateWallet.wallet_id}, total: ${totalRebate}, daily: ${dailyCredit}`);
        } else {
            console.error(`❌ Error inserting rebate schedule for memberId: ${memberId}.`);
        }   
        
    } catch (error) {
        console.error(`❌ Error inserting rebate schedule for memberId: ${memberId}:`, error);
        throw error;
    }
};


// Get all active rebate records for a given member ID
const getActiveRebateRecordsByUserId = async (userId, connection) => {
    const sql = `SELECT id, wallet_id, remaining_rebate, member_id 
                 FROM rebate_point_schedule 
                 WHERE user_id = ? AND status = 'active'`;
    const [results] = await connection.query(sql, [userId]);
    return results;
};

// Update remaining rebate in a specific rebate record
const updateRebateBalance = async (rebateId, newBalance, connection) => {
    const sql = `UPDATE rebate_point_schedule 
                 SET remaining_rebate = ? 
                 WHERE id = ?`;
    await connection.query(sql, [newBalance, rebateId]);
};


/**
 * 
 * wallet_id: Links to the wallets table.
 * total_rebate: Total RP assigned at package purchase.
 * remaining_rebate: RP yet to be credited.
 * daily_credit: get from settings default is 0.125.
 * last_credited_at: Stores the last time RP was credited. 
 */

// Get all active rebate schedules (remaining_rebate > 0)
const getActiveRebateSchedules = async (connection) => {
    const sql = `
        SELECT rps.member_id, rps.wallet_id, rps.remaining_rebate, rps.daily_credit
        FROM rebate_point_schedule rps
        JOIN wallets w ON rps.wallet_id = w.wallet_id
        WHERE rps.remaining_rebate > 0 AND rps.status = 'active'`;
    
    const [results] = await connection.query(sql);
    return results;
};

// Update remaining rebate after daily credit
const updateRemainingRebate = async (walletId, creditAmount, connection) => {
    const sql = `
        UPDATE rebate_point_schedule 
        SET remaining_rebate = remaining_rebate - ?, last_credited_at = NOW()
        WHERE wallet_id = ?`;
    
    await connection.query(sql, [creditAmount, walletId]);
};

// Mark rebate schedule as inactive when fully credited
const setRebateScheduleInactive = async (walletId, connection) => {
    const sql = `UPDATE rebate_point_schedule SET status = 'inactive' WHERE wallet_id = ?`;
    await connection.query(sql, [walletId]);
};

module.exports = { 
    getActiveRebateSchedules, 
    updateRemainingRebate, 
    setRebateScheduleInactive, 
    logRebateCredit,
    getActiveRebateRecordsByUserId ,
    updateRebateBalance
};

