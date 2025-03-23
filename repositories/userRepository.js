/**
 * Centralized database queries for users.
 * Easily reusable in different parts of the application.
 */
const db = require('../config/dbConfig');
const crypto = require('crypto');

const getAllUsers = async () => {
    const [rows] = await db.query("SELECT * FROM users");
    return rows;
};

const getDownlineByReferralId = async (id) => {
    const [rows] = await db.query("SELECT username FROM users where referral_id = ?", [id]);
    return rows;
};

const getDownlineByUsername = async (userData) => {
    // Step 1: Get root user's ID
    const sqlRoot = `SELECT id FROM users WHERE username = ?`;
    const [rootRows] = await db.execute(sqlRoot, [userData.rootUsername]);

    if (rootRows.length === 0) {
        throw new Error("Root user not found.");
    }

    const rootId = rootRows[0].id;

    // Step 2: Check if searchUsername is in rootUsername’s hierarchy
    const searchUser = await findUserInHierarchy(rootId, userData.searchUsername);

    if (!searchUser) {
        return { valid: false };
    }

    // Step 3: Fetch downlines of searchUsername
    const downlines = await fetchDownlines(searchUser.id);

    return { valid: true, downlines };
};

// Recursively check if user is in the hierarchy
const findUserInHierarchy = async (rootId, searchUsername) => {
    const sql = `SELECT id, username, referral_id FROM users WHERE username = ?`;
    const [userRows] = await db.execute(sql, [searchUsername]);

    if (userRows.length === 0) return null;

    let currentUser = userRows[0];

    while (currentUser.referral_id !== null) {
        if (currentUser.referral_id === rootId) {
            return currentUser;
        }

        // Fetch parent user
        const sqlParent = `SELECT id, username, referral_id FROM users WHERE id = ?`;
        const [parentRows] = await db.execute(sqlParent, [currentUser.referral_id]);

        if (parentRows.length === 0) return null;

        currentUser = parentRows[0];
    }

    return null;
};

// Recursive function to get all downlines
const fetchDownlines = async (userId) => {
    const sql = `SELECT id, username, referral_id FROM users WHERE referral_id = ?`;
    const [downlineRows] = await db.execute(sql, [userId]);

    for (let downline of downlineRows) {
        downline.sub_downlines = await fetchDownlines(downline.id);
    }

    return downlineRows;
};


const generateMemberID = async () => {
    const [latestMember] = await db.execute("SELECT id FROM users ORDER BY id DESC LIMIT 1");
    const nextId = latestMember.length > 0 ? latestMember[0].id + 1 : 1;
    return `WE${String(nextId)}`;
};

// Generate a unique 8-character referral code (Base-62)
const generateReferralCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    let isUnique = false;
    let referralCode = '';

    while (!isUnique) {
        // Generate a random 8-character code
        referralCode = Array.from({ length: 8 }, () => chars[crypto.randomInt(0, chars.length)]).join('');

        // Check if the code already exists in the database
        const [existing] = await db.execute("SELECT COUNT(*) AS count FROM users WHERE referral_code = ?", [referralCode]);

        if (existing.count === 0) {
            isUnique = true; // Code is unique, exit the loop
        }
    }

    return referralCode;
};


const registerUser = async (userData) => {
    console.log("userRepository.registerUser");
    console.log("Request:", userData);

    try {
        const sql = `
            INSERT INTO users (username, password, email, role_id, status_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            userData.username,
            userData.password_hash,
            userData.email,
            userData.role_id,
            userData.status_id
        ]);

        console.log("Result:", result);
        return result;
    } catch (error) {
        console.error("Error registering user:", error.message);
        throw error;
    }
};


const updateUser = async (id, user) => {
    const { name, username, password, email, role } = user;
    const sql = 'UPDATE members SET name = ?, username = ?, password = ?, email = ?,  role = ? WHERE id = ?';
    const [result] = await db.execute(sql, [name, username, password, email, role, id]);
    return result;
};

const getUserByUsername = async (username) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    console.log("db response: " , rows[0])
    return rows.length > 0 ? rows[0] : null;
};

const getUserById = async (id) => {
    console.log("getUserById: ", id);
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    console.log("db response: " , rows[0])
    return rows.length > 0 ? rows[0] : null;
};
const updateUserStatus = async (memberId, statusId, packageId, connection) => {
    const updateUserQuery = `UPDATE users SET status_id = ?, updated_at = NOW() WHERE id = ?`;
    const updateMemberQuery = `UPDATE members SET status_id = ?, package_id = ?, updated_at = NOW() WHERE user_id = ?`;

    try {
        // Start transaction
        await connection.beginTransaction();

        // Update `users` table
        const [userResult] = await connection.query(updateUserQuery, [statusId, memberId]);

        // Update `members` table
        const [memberResult] = await connection.query(updateMemberQuery, [statusId, packageId, memberId]);

        // Commit transaction if both updates succeed
        await connection.commit();
        return { userResult, memberResult };
    } catch (error) {
        // Rollback transaction if any error occurs
        await connection.rollback();
        console.error("Error updating user and member status:", error);
        throw new Error("Failed to update user and member status.");
    }
};


module.exports = { 
    getAllUsers, 
    registerUser,
    getDownlineByUsername,
    getDownlineByReferralId,
    updateUser, 
    getUserByUsername, 
    getUserById,
    generateMemberID,
    generateReferralCode,
    updateUserStatus
};