const db = require('../config/dbConfig');

async function getMatchingLevels() {
    const query = `SELECT level, percent FROM matching_bonus_config ORDER BY level ASC`;
    const [result] =  await db.query(query);
    return result;
}

async function getUplineParent(memberId) {
    const query = `
        SELECT 
            m.parent_id, 
            u.username 
        FROM members m
        LEFT JOIN users u ON u.id = (
            SELECT user_id FROM members WHERE id = m.parent_id
        )
        WHERE m.id = ?;
    `;

    try {
        const [result] = await db.query(query, [memberId]);
        
        // If no result or parent_id is null, return null directly
        if (result.length === 0 || result[0].parent_id === null) {
            return null;
        }

        return {
            parent_id: result[0].parent_id,
            username: result[0].username || null
        };

    } catch (error) {
        console.error("Error fetching upline parent:", error);
        throw new Error("Failed to retrieve upline parent.");
    }
}



async function getRvBalance(memberId) {
    console.log("getRvBalance : " , memberId)
    const query = `SELECT balance FROM wallets WHERE member_id = ? AND wallet_type_id = 6`;
    const [result] = await db.query(query, [memberId]);
    console.log("getRvBalance : " , result);
    return result.length > 0 ? result[0].balance : 0;
}

async function creditWallet(memberId, walletType, amount) {
    try{
        const query = `UPDATE wallets SET balance = balance + ?, updated_at = NOW()  WHERE member_id = ? AND wallet_type_id = ?`;
        const [result] = await db.query(query, [amount, memberId, walletType]);
        if (result.affectedRows === 1) {
            console.log(`✅ Successfully to credit ${amount} to wallet ${walletType}.`);
            return true;
        } else {
            console.log(`❌ Failed to create ${amount} to wallet ${walletType}.`);
            throw new Error(`❌ Failed to create ${amount} to wallet ${walletType}.`);
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to credit ${amount} to wallet ${walletType}. Database error: ${e.message}`);
    }
    
}

async function debitWallet(memberId, walletType, amount) {
    try{
        const query = `UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE member_id = ? AND wallet_type_id = ?`;
        const [result] = await db.query(query, [amount, memberId, walletType]);
        if (result.affectedRows === 1) {
            console.log(`✅ Successfully to debit ${amount} from wallet ${walletType}.`);
            return true;
        } else {
            console.log(`❌ Failed to debit ${amount} from wallet ${walletType}.`);
            throw new Error(`❌ Failed to debit ${amount} from wallet ${walletType}.`);
        }    
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to debit ${amount} from wallet ${walletType}. Database error: ${e.message}`);
    }
    
}

// Get pending bonuses
const getPendingReferralBonuses = async () => {
    const query = `SELECT id, member_id as memberId, sponsor_id as sponsorId, usdt_amount as usdtAmount, ap_amount as apAmount 
                    FROM referral_bonus 
                    WHERE status = 'pending' 
                    AND created_at < NOW() - INTERVAL 1 DAY`;
    return await db.query(query);
};

// Get pending bonuses
const getPendingMatchingBonuses = async () => {
    const query = `SELECT id,member_id as memberId, parent_id as parentId, bonus_amount as bonusAmount, usdt_amount as usdtAmount, ap_amount as apAmount 
                    FROM matching_bonus 
                    WHERE status = 'pending' 
                    AND created_at < NOW() - INTERVAL 1 DAY;`;
    return await db.query(query);
};

async function updatePendingBonus(memberId, username, typeId, balance) {
    try{
        const query = `INSERT INTO wallets (member_id, username, wallet_type_id, balance) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [memberId, username, typeId, balance]);
        if (result.affectedRows === 1) {
            console.log("�� Successful update balance of pending bonus.");
            return true;
        } else {
            console.log("�� Failed update balance of pending bonus. No rows affected.");
            throw new Error("�� Failed update balance of pending bonus. No rows affected.");
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to update pending bonus. Database error: ${e.message}`);
    }
}

async function updateReferralBonusStatus(bid, status, toCompany) {
    try{
        const query = `UPDATE referral_bonus SET status = ?, updated_at = NOW(), to_company =? WHERE id =?`;
        const [result] = await db.query(query, [status, toCompany, bid]);
        if (result.affectedRows === 1) {
            console.log("✅ Successful update status of Referral Bonus.");
            return true;
        } else {
            console.log("❌ Failed update status of Referral Bonus. No rows affected.");
            throw new Error("❌ Failed update status of Referral Bonus. No rows affected.");
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to update Referral Bonus. Database error: ${e.message}`);
    }
    
}
async function updateMatchingBonusStatus(bid, status, toCompany) {
    try{
        const query = `UPDATE matching_bonus SET status = ?, updated_at = NOW(), to_company =? WHERE id= ?`;
        const [result] = await db.query(query, [status, toCompany, bid]);
        if (result.affectedRows === 1) {
            console.log("✅ Successful update status of Matching Bonus.");
            return true;
        } else {
            console.log("❌ Failed update status of Matching Bonus. No rows affected.");
            throw new Error("❌ Failed update status of Matching Bonus. No rows affected.");
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to update Matching Bonus. Database error: ${e.message}`);
    }
    
}

async function insertReferralBonus(memberId, sponsorId, packageId, totalBonus, usdtBonus, apBonus, description) {
    try{
        const query = `INSERT INTO referral_bonus (member_id, sponsor_id, package_id, bonus_amount, usdt_amount, ap_amount, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(query, [memberId, sponsorId, packageId, totalBonus, usdtBonus, apBonus, description]);
        if (result.affectedRows === 1) {
            console.log("✅ Referral bonus created successfully:");
            return result.insertId; // Return the new transaction ID
        } else {
            console.log("❌ Failed to create Referral bonus. No rows affected.");
            throw new Error("❌ Failed to create Referral bonus. No rows affected.");
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`�� Failed to create Referral Bonus. Database error: ${e.message}`);
    }
  
}

async function insertMatchingBonus(memberId, parentId, packageId, level, totalBonus, usdtBonus, apBonus, description) {
    try{
        const query = `INSERT INTO matching_bonus (member_id, parent_id, package_id, level, bonus_amount, usdt_amount, ap_amount, description) VALUES (?, ?, ?, ?, ?, ?, ? ,?)`;
        const [result] = await db.query(query, [memberId, parentId, packageId, level, totalBonus, usdtBonus, apBonus, description]);
        if (result.affectedRows === 1) {
            console.log("✅ Matching Bonus created successfully:");
            return result.insertId; // Return the new transaction ID
        } else {
            console.log("❌ Failed to create Matching Bonus. No rows affected.");
            throw new Error("❌ Failed to create Matching Bonus. No rows affected.");
        }
    } catch (e) {
        console.error("�� Database error:", e);
        throw new Error(`❌ Failed to create Matching Bonus. Database error: ${e.message}`);
    }
    
  }



module.exports = { 
  getMatchingLevels, 
  getUplineParent, 
  getRvBalance, 
  creditWallet,
  debitWallet,
  getPendingReferralBonuses,
  getPendingMatchingBonuses,
  updatePendingBonus, 
  updateReferralBonusStatus,
  updateMatchingBonusStatus,
  insertReferralBonus, 
  insertMatchingBonus,
};
