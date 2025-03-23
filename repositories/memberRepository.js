const db = require('../config/dbConfig');

const createMember = async (memberData) => {
    const sql = `INSERT INTO members (username, sponsor_id, placement_id, parent_id, account_type) 
                 VALUES (?, ?, ?, ?, ?)`;
    const values = [memberData.username, memberData.sponsor_id, memberData.placement_id, memberData.parent_id, memberData.account_type];
    const [result] = await db.execute(sql, values);
    return { id: result.insertId, ...memberData };
};

const getAllMembers = async () => {
    const sql = `SELECT * FROM members`;
    const [rows] = await db.execute(sql);
    return rows;
};

const getAllAccounts = async (id) => {
    const sql = `SELECT id, user_id, sponsor_id, referral_id, parent_id, sub_username, account_type, account_layer, position, package_id, referral_code, status_id FROM members where user_id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows;
};


const getMemberByUsername = async (id) => {
    const sql = `SELECT * FROM members WHERE sub_username = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
};
const getMemberByUserId = async (id) => {
    const sql = `SELECT * FROM members WHERE user_id = ? and account_type = 'master'`;
    const [rows] = await db.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
};
const getMemberById = async (id) => {
    const sql = `SELECT * FROM members WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
};

const getPackageById = async (id) => {
    const sql = `SELECT package_id FROM members WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows.length > 0 ? rows[0].package_id : null;
};

const updateMember = async (id, updateData) => {
    const sql = `UPDATE members SET username = ?, sponsor_id = ?, placement_id = ?, parent_id = ?, account_type = ? 
                 WHERE id = ?`;
    const values = [updateData.username, updateData.sponsor_id, updateData.placement_id, updateData.parent_id, updateData.account_type, id];
    await db.execute(sql, values);
    return getMemberById(id);
};

const getDownline = async (id) => {
    const sql = `SELECT * FROM members WHERE sponsor_id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows;
};

const getSponsor = async (id) => {
    const sql = `SELECT m1.*, m2.username AS sponsor_name FROM members m1 
                 JOIN members m2 ON m1.sponsor_id = m2.id WHERE m1.id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
};

const getDirectSponsors = async (userId, limit = 3) => {
    const [rows] = await db.execute(
        `SELECT id, username, name, email FROM members WHERE sponsor_id = ? LIMIT ?`,
        [userId, limit]
    );
    return rows;
};

const hasSubMembers = async (memberId) => {
    const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM members WHERE sponsor_id = ?`,
        [memberId]
    );
    return rows[0].count > 0;
};

// ✅ Function used by registerUser
// ✅ Function to Check if Referral Code Already Exists
const getMemberByReferralCode = async (referralCode) => {
    try {
        const sql = `SELECT * FROM members WHERE referral_code = ? LIMIT 1`;
        const [rows] = await db.execute(sql, [referralCode]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error fetching member by referral code:", error.message);
        throw error;
    }
};

const registerMember = async (memberData) => {
    console.log("memberRepository.registerMember");
    console.log("Request:", memberData);

    try {
        const sql = `
            INSERT INTO members (user_id, sponsor_id, referral_id, referral_code, account_type, status_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            memberData.user_id,
            memberData.sponsor_id,
            memberData.sponsor_id,
            memberData.referral_code,
            memberData.account_type,
            memberData.status_id
        ]);

        console.log("Result:", result);
        return result;
    } catch (error) {
        console.error("Error registering member:", error.message);
        throw error;
    }
};
/*
const getDownlineMembers = async (sponsorId) => {
    const sql = `
        SELECT id, user_id, referral_code, status_id, total_downline_count, total_bonus_earned 
        FROM members 
        WHERE sponsor_id = ?
    `;
    const [rows] = await db.execute(sql, [sponsorId]);
    return rows;
};
*/
const getDownlineMembers = async (sponsorId) => {
    console.log('getDownlineMembers:', sponsorId);

    // Query to fetch sponsor details
    const sponsorQuery = `
        SELECT 
            m.id AS member_id,
            m.user_id, 
            m.referral_code, 
            u.username, 
            us.status_id,
            us.status_name,
            m.total_downline_count, 
            m.total_bonus_earned 
        FROM members m
        JOIN users u ON m.user_id = u.id
        JOIN user_statuses us ON u.status_id = us.status_id
        WHERE m.id = ?
    `;

    // Query to fetch direct downline members
    const downlineQuery = `
        SELECT 
            m.id AS member_id, 
            m.user_id, 
            m.referral_code, 
            u.username, 
            us.status_id,
            us.status_name,
            m.total_downline_count, 
            m.total_bonus_earned 
        FROM members m
        JOIN users u ON m.user_id = u.id
        JOIN user_statuses us ON u.status_id = us.status_id
        WHERE m.sponsor_id = ?
    `;

    // Execute both queries
    const [sponsorRows] = await db.execute(sponsorQuery, [sponsorId]);
    const [downlineRows] = await db.execute(downlineQuery, [sponsorId]);

    // Combine sponsor and downline into a single array
    return [...sponsorRows, ...downlineRows];
};



const getAllDownlineMembers = async (sponsorId, username) => {
    const query = `
        WITH RECURSIVE downline AS (
            -- Step 1: Get the full downline for the logged-in user
            SELECT m.id AS member_id, m.user_id, m.sponsor_id, u.username, u.status_id, us.status_name, m.referral_code
            FROM members m
            JOIN users u ON m.user_id = u.id
            JOIN user_statuses us ON u.status_id = us.status_id
            WHERE m.user_id = ? -- Logged-in user ID

            UNION ALL

            -- Step 2: Recursively get all direct downline members
            SELECT m.id AS member_id, m.user_id, m.sponsor_id, u.username, u.status_id, us.status_name, m.referral_code
            FROM members m
            JOIN users u ON m.user_id = u.id
            JOIN user_statuses us ON u.status_id = us.status_id
            INNER JOIN downline d ON m.sponsor_id = d.member_id
        ),

        target_user AS (
            -- Step 3: Find the searched user's member_id (Kenny) if they are in the logged-in user's downline
            SELECT member_id FROM downline WHERE username = ? LIMIT 1
        )

        -- Step 4: Get Kenny **and** his direct downline members
        SELECT m.id AS member_id, m.user_id, m.sponsor_id, u.username, u.status_id, us.status_name, m.referral_code
        FROM members m
        JOIN users u ON m.user_id = u.id
        JOIN user_statuses us ON u.status_id = us.status_id
        WHERE m.id IN (SELECT member_id FROM target_user) -- Include Kenny
        OR m.sponsor_id IN (SELECT member_id FROM target_user); -- Include Kenny's direct downline

    `;

    const [rows] = await db.execute(query, [sponsorId,username]);
    return rows;
};

const createSubAccounts = async (userId, subAccounts, connection) => {
    if (!Array.isArray(subAccounts) || subAccounts.length === 0) {
        console.warn("Warning: subAccounts is empty or not an array.");
        return;
    }

    const values = subAccounts.map(acc => 
        `('${acc.sub_username}', ${userId}, '${acc.account_type}', ${acc.level}, ${acc.parent_id ? acc.parent_id : "NULL"}, '${acc.referral_code}', NOW())`
    ).join(", ");

    const query = `
        INSERT INTO members (sub_username, user_id, account_type, account_layer, parent_id, referral_code, created_at) 
        VALUES ${values}`;
    
    await connection.query(query);
};
const createSubAccount = async (subAccount, connection) => {
    console.log(typeof subAccount);
    console.log("subAccount : " , subAccount);
    if (!subAccount || typeof subAccount !== "object") {
        throw new Error("Invalid subAccount data. Expected a JSON object.");
    }

    const query = `
        INSERT INTO members (sub_username, user_id, account_type, account_layer, parent_id, position, created_at) 
        VALUES (? ,?, ?, ?, ?, ?, NOW())`;

    const values = [
        subAccount.sub_username, 
        subAccount.user_id, 
        subAccount.account_type, 
        subAccount.account_layer, 
        subAccount.parent_id || null,  // Handle null parent_id correctly
        subAccount.position
    ];

    try {
        const [result] = await connection.query(query, values);

        if (result.affectedRows === 1) {
            console.log("✅ Subaccount created successfully:", subAccount.sub_username);
            return result.insertId; // Return the new member ID
        } else {
            throw new Error("❌ Failed to create subaccount. No rows affected.");
        }
    } catch (error) {
        console.error("❌ Database error:", error.message);
        throw new Error(`Database error: ${error.message}`);
    }
};

const checkPositionAvailability = async (sponsorId, position) => {
    const query = `SELECT COUNT(*) AS count FROM members WHERE parent_id = ? AND position = ?`;
    const [rows] = await db.execute(query, [sponsorId, position]);
    return rows[0].count === 0;
};

const updateParentId = async (memberId, position, sponsorId) => {
    const query = `UPDATE members SET parent_id = ?, position = ?, updated_at = NOW() WHERE id = ?`;
    const [result] =await db.execute(query, [sponsorId, position, memberId]);
    if (result.affectedRows === 1) {
        console.log(`✅ Successfully placement ${memberId} under ${sponsorId} with position ${position}`);
        return true;
    } else {
        console.log(`❌ Failed to placement ${memberId} under ${sponsorId}.`);
        throw new Error(`❌ Failed to placement ${memberId} under ${sponsorId}.`);
    }
};



const getMemberDetails = async (memberId) => {
    const query = `
        SELECT m.id,
            CASE 
                WHEN m.account_type = 'master' THEN u.username
                ELSE m.sub_username
            END AS username,
            COALESCE(w.balance, 0) AS reward_balance,
            (SELECT value FROM settings WHERE key_name = 'reward_value' LIMIT 1) AS reward_value,
            m.parent_id 
        FROM members m
        LEFT JOIN users u ON m.user_id = u.id  -- Get username from users if master
        LEFT JOIN wallets w ON m.id = w.member_id AND w.wallet_type_id = 6
        WHERE m.id = ?
    `;

    const [results] = await db.query(query, [memberId]);
    return results.length ? results[0] : null;
};


const getChildren = async (parentId) => {
    const query = `
        SELECT m.id AS id, m.sub_username, m.position,
            COALESCE(w.balance, 0) AS reward_balance,
            (SELECT value FROM settings WHERE key_name = 'reward_value' LIMIT 1) AS reward_value,
            m.parent_id
        FROM members m
        LEFT JOIN wallets w ON m.id = w.member_id AND w.wallet_type_id = 6
        WHERE m.parent_id = ? 
        ORDER BY FIELD(m.position, 'left', 'middle', 'right')
    `;
    
    const [results] = await db.query(query, [parentId]);
    return results.map(child => ({
        id: child.id,
        sub_username: child.sub_username,
        position: child.position,
        reward_balance: child.reward_balance,
        reward_value: child.reward_value,
        parent_id: child.parent_id,
        children: []
    }));
};

async function getAvailablePosition(memberId, connection) {
    console.log("🔍 Searching for available position under member:", memberId);

    // Get ALL downlines, including deeper levels
    const downlines = await getAllDownlines(memberId, connection);
    console.log("📌 Total Downlines Found:", downlines.length);
    console.log("downlines: ", downlines);

    // BFS queue initialization
    let queue = [{ parentId: memberId, level: 1 }];

    while (queue.length > 0) {
        let { parentId, level } = queue.shift();
        console.log(`📍 Checking parentId: ${parentId} at level: ${level}`);

        // 🔥 Fix: Ensure type safety in parent-child comparison
        let children = downlines.filter(d => String(d.parent_id) === String(parentId));
        console.log(`👶 Found ${children.length} children under parentId: ${parentId}`);

        // Possible positions
        let positions = ["left", "middle", "right"];
        let occupiedPositions = children.map(c => c.position);

        // Find the first available position
        for (let position of positions) {
            if (!occupiedPositions.includes(position)) {
                console.log(`✅ Found available position: ${position} under parentId: ${parentId}`);
                return { parentId, position };
            }
        }

        // If all positions are occupied, enqueue children for next-level search
        queue.push(...children.map(c => ({ parentId: c.id, level: level + 1 })));
    }

    throw new Error("❌ No available placement found! Check your data.");
}



const getAllDownlines = async (memberId, connection) => {
    const query = `
        WITH RECURSIVE downline AS (
            SELECT id, parent_id, position FROM members WHERE parent_id = ?
            UNION ALL
            SELECT m.id, m.parent_id, m.position FROM members m
            INNER JOIN downline d ON m.parent_id = d.id
        )
        SELECT * FROM downline;
    `;
    const [rows] = await connection.execute(query, [memberId]);
    return rows;
};

const getDirectSubaccounts = async (userId, connection) => {
    const query = `
        SELECT id, account_layer, sub_username
        FROM members
        WHERE user_id = ? and account_type = 'sub'
    `;
    const [rows] = await connection.execute(query, [userId]);
    return rows;
};





module.exports = {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    getDownline,
    getSponsor,
    getDirectSponsors,
    hasSubMembers,
    getMemberByUsername,
    getMemberByReferralCode, 
    registerMember,
    getDownlineMembers,
    getAllDownlineMembers,
    createSubAccounts,
    createSubAccount,
    checkPositionAvailability,
    updateParentId,
    getChildren,
    getMemberDetails,
    getPackageById,
    getMemberByUserId,
    getAllAccounts,
    getAvailablePosition,
    getAllDownlines,
    getDirectSubaccounts
    
};
