const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const memberRepository = require('../repositories/memberRepository');


const getAllUsers = async () => {
    return userRepository.getAllUsers();
};

const getUserById = async () => {
    return userRepository.getUserById();
};
const getDownlineByReferralId = async (id) => {
    console.log('userService.getDownlineByReferralId : ', id);  
    return userRepository.getDownlineByReferralId(id);
};
const getDownlineByUsername = async (userData) => {
    console.log('userService.getDownlineByUsername : ', userData);  
    return userRepository.getDownlineByUsername(userData);
};

const updateUser = async (id,userData) => {
    return userRepository.updateUser(id,userData);
};


const registerUser = async (userData) => {
    try {
        console.log("userService.registerUser");
        console.log("Request:", userData);

        // ✅ Generate Unique Referral Code
        const referralCode = await generateUniqueReferralCode();
        console.log("referralCode:", referralCode);
        // ✅ Hash password
        userData.password_hash = await bcrypt.hash(userData.password, 10);
        console.log("password_hash:", userData.password_hash);
        delete userData.password;

        // ✅ Default Status: "Registered"
        const defaultStatusId = 3;

        // Default values
        const defaultRoleId = userData.role_id || 2; // Default role_id (2 = Member)

        // Validate referral (if provided)
        let sponsorId = null;
        if (userData.referral_code) {
            const sponsor = await memberRepository.getMemberByReferralCode(userData.referral_code);
            if (!sponsor) {
                return { code: "E003", message: "Invalid referral code." };
            }
            console.log("Sponsor : " , sponsor);
            sponsorId = sponsor.id;
        }

        // ✅ Start transaction Call Repository to Store User Data
        const result = await userRepository.registerUser({
            ...userData,
            status_id: defaultStatusId,
            role_id: defaultRoleId
        });

        if (result.affectedRows > 0) {
            const userId = result.insertId; // Get inserted user ID

            // Insert into members table
            const memberData = {
                user_id: userId,
                sponsor_id: sponsorId,
                referral_code: referralCode,
                account_type: 'master',
                status_id: defaultStatusId,
                created_by: userData.created_by
            };

            const memberResult = await memberRepository.registerMember(memberData);

            if (memberResult.affectedRows > 0) {
                console.log(`User ${userData.username} registered successfully!`);
                return { code: "S001", message: "User registered successfully!" };
            }
        }

        console.log("User registration failed.");
        return { code: "E002", message: "User registration failed." };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const match = error.message.match(/Duplicate entry '(.+?)'/);
            const duplicateValue = match ? match[1] : "Unknown";
            return { code: "E001", message: `Duplicate entry '${duplicateValue}' already exists.` };
        }
        return { code: "E001", message: "An unexpected error occurred.", error: error.message };
    }
};

// ✅ Function to Generate Unique Referral Code
const generateUniqueReferralCode = async () => {
    let isUnique = false;
    let referralCode = "";

    while (!isUnique) {
        referralCode = generateRandomCode(); // Generate random code
        const existingUser = await memberRepository.getMemberByReferralCode(referralCode);
        if (!existingUser) {
            isUnique = true;
        }
    }
    return referralCode;
};

// ✅ Random Code Generator (e.g., "ABC1234")
const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};



module.exports = { registerUser };


module.exports = { 
    getAllUsers,
    getUserById,
    updateUser,
    registerUser,
    getDownlineByReferralId,
    getDownlineByUsername,
    generateUniqueReferralCode
};