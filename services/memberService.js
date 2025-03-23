const memberRepository = require('../repositories/memberRepository');
const packageRepository = require('../repositories/packageRepository');
const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');
//const userService = require('../services/userService');
const rebateRepository = require('../repositories/rebateRepository');
const settingRepository = require('../repositories/settingRepository');
const bonusQueue = require('../queues/bonusQueue');
const db = require('../config/dbConfig');
const { createBep20Address } = require("../utils/bep20");
const usdtWalletRepository = require("../repositories/usdtWalletRepository");

// Register New Member (Sign Up)
const registerMember = async (memberData) => {
    // Validate sponsor exists
    if (memberData.sponsor_id) {
        const sponsor = await memberRepository.getMemberById(memberData.sponsor_id);
        if (!sponsor) throw new Error("Sponsor not found");
    }

    return memberRepository.createMember(memberData);
};
// Get All Members
const getAllMembers = async () => {
    return memberRepository.getAllMembers();
};
// Get All Sub Account
const getAllAccounts = async (userId) => {
    return memberRepository.getAllAccounts(userId);
};
// Get specific Member profile
const getMemberById = async (id) => {
    return memberRepository.getMemberById(id);
};
// Update member details
const updateMember = async (id, updateData) => {
    return memberRepository.updateMember(id, updateData);
};
// Get Direct Sponsors Members
const getDownline = async (id) => {
    return memberRepository.getDownline(id);
};
// Get Sponsors
const getSponsor = async (id) => {
    return memberRepository.getSponsor(id);
};

const getFirstLevelMembers = async (userId, limit = 3) => {
    const directMembers = await memberRepository.getDirectSponsors(userId, limit);

    const response = await Promise.all(directMembers.map(async (member) => {
        const hasMore = await memberRepository.hasSubMembers(member.id);
        console.log("hasMore : ", hasMore);
        return { ...member, hasMore, children: [] }; // Children are empty initially
    }));

    return { id: userId, children: response };
};

const getChildrenMembers = async (userId, limit = 3) => {
    const members = await memberRepository.getDirectSponsors(userId, limit);

    return members.map(member => ({
        ...member,
        hasMore: false, // No need to check sub-levels now
        children: []
    }));
};
/*
const getDownlineTree = async (req) => {
    try {
        console.log("Fetching downline members for sponsor:", req.params.sponsorId);

        // Get the direct downline members
        const downline = await memberRepository.getDownlineMembers(req.params.sponsorId);

        // Recursively fetch downline members to form a tree structure
        const buildTree = async (members) => {
            for (let member of members) {
                const children = await memberRepository.getDownlineMembers(member.id);
                if (children.length > 0) {
                    member.children = await buildTree(children);
                } else {
                    member.children = [];
                }
            }
            return members;
        };

        const hierarchy = await buildTree(downline);
        return { code: "S001", message: "Downline retrieved successfully", data: hierarchy };
    } catch (error) {
        console.error("Error fetching downline:", error);
        return { code: "E001", message: "Failed to fetch downline", error: error.message };
    }
};
*/
const getDownlineTree = async (req) => {
    try {
        const downlineMembers = await memberRepository.getDownlineMembers(req.params.sponsorId);

        if (!downlineMembers || downlineMembers.length === 0) {
            return { code: "E002", message: "No downline found for the given sponsor." };
        }

        // Extract sponsor (first item in array) and its downline (remaining items)
        const [sponsor, ...downline] = downlineMembers;

        // Format sponsor details
        const formattedSponsor = {
            id: sponsor.member_id,
            username: sponsor.username,
            referral_code: sponsor.referral_code,
            status: {
                id: sponsor.status_id,
                name: sponsor.status_name
            }
        };

        // Format downline details
        const formattedDownline = downline.map(member => ({
            id: member.member_id,
            username: member.username,
            referral_code: member.referral_code,
            status: {
                id: member.status_id,
                name: member.status_name
            }
        }));

        return {
            code: "S001",
            message: "Downline retrieved successfully",
            data: {
                sponsor: formattedSponsor,
                downline: formattedDownline
            }
        };
    } catch (error) {
        return { code: "E001", message: "Failed to retrieve downline.", error: error.message };
    }
};


const searchDownline = async (sponsorId, searchUsername) => {
    console.log("Accessing searchDownline");
    const foundMember = await memberRepository.getAllDownlineMembers(sponsorId, searchUsername);
    console.log("allDownlines : " , foundMember);
   
    if (!foundMember || foundMember.length === 0) {
        return { code: "E002", message: "User not found in your downline" };
    }

    // Extract the sponsor (searched user) and their direct downline
    const sponsor = foundMember.find(member => member.username === searchUsername);
    const downline = foundMember.filter(member => member.sponsor_id === sponsor?.member_id);

    return {
        code: "S001",
        message: "Downline retrieved successfully",
        data: {
            sponsor,
            downline
        }
    };
};

const purchasePackageForMember = async (sponsorId, userId, memberId, packageId, username) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Retrieve package details
        const packageDetail = await packageRepository.getPackageById(packageId);
        console.log("Package : " , packageDetail);
        if (!packageDetail) throw new Error("Invalid package selected.");
        // Destructure packageDetail
        const {
            package_name,
            price,
            wallet_usdt,
            wallet_ap,
            usdt_percent,
            ap_percent,
            shopping_point,
            subaccount
        } = packageDetail;

        const usdtRequired = wallet_usdt ? (price * usdt_percent) / 100 : 0;
        const apRequired = wallet_ap ? (price * ap_percent) / 100 : 0;
        console.log("usdtRequired : " , usdtRequired);
        console.log("apRequired : " , apRequired);

        // Fetch rebate_credit from settings
        const rebateCreditDaily = await settingRepository.getSettingValueByKeyName("rebate_credit");
        if (!rebateCreditDaily) throw new Error("Rebate credit configuration missing.");

        // Fetch rebate configuration
        const rebateConfig = await packageRepository.getRebatePointsConfig(packageId);
        if (!rebateConfig) throw new Error("Rebate point configuration not found.");
        const { total_points } = rebateConfig;

        // Check sponsor's wallet balances
        const sponsorWallets = await walletRepository.getWalletsByMemberId(sponsorId, connection);
        const usdtWallet = sponsorWallets.find(w => w.wallet_type_id === 1);
        const apWallet = sponsorWallets.find(w => w.wallet_type_id === 2);
        console.log("usdtWallet : " , usdtWallet);
        console.log("apWallet : " , apWallet);
        console.log("usdtRequired : " + usdtRequired);
        console.log("apRequired : " + apRequired);
        if (wallet_usdt && (!usdtWallet || usdtWallet.balance < usdtRequired)) {
            throw new Error("Insufficient USDT balance in sponsor wallet.");
        }
        if (wallet_ap && (!apWallet || apWallet.balance < apRequired)) {
            throw new Error("Insufficient AP balance in sponsor wallet.");
        }

        // Deduct sponsor's wallet balances
        if (wallet_usdt) {
            await walletRepository.updateWalletBalance(usdtWallet.wallet_id, usdtWallet.balance - usdtRequired, connection);
            await transactionRepository.createTransaction(sponsorId, "DEBIT", `Purchase Package ${package_name}`, 1, usdtRequired, "Sponsor package purchase (USDT)", connection);
        }
        if (wallet_ap) {
            await walletRepository.updateWalletBalance(apWallet.wallet_id, apWallet.balance - apRequired, connection);
            await transactionRepository.createTransaction(sponsorId, "DEBIT", `Purchase Package ${package_name}`, 2, apRequired, "Sponsor package purchase (AP)", connection);
        }

        // Create Master and Sub Accounts
        let generatedAccounts = [];

        // Add master account to generated accounts
        const masterAccount = {
            sub_username: username,
            account_type: "master",
            level: 1,
            parent_id: null,
            member_id: memberId, // Ensure master account member_id is included
        };
        generatedAccounts.push(masterAccount);

        if (subaccount === 3 || subaccount === 12) {
            let secondLevelAccounts = [], thirdLevelAccounts = [];
            const masterMemberId = memberId;
            const positions = ["left", "middle", "right"]; // Position mapping
            // Step 1: Create 3 second-level subaccounts
            for (let i = 1; i <= 3; i++) {
                let subUsername = `${username}-${String(i).padStart(2, "0")}`;
                let position = positions[i - 1]; // Assign position based on index

                const existingAccount = await memberRepository.getMemberByUsername(subUsername);
                if (existingAccount) {
                    throw new Error(`Subaccount ${subUsername} already exists.`);
                }

                const subAccount = {
                    sub_username: subUsername, 
                    account_type: "sub", 
                    level: 2, 
                    parent_id: memberId, 
                    user_id: userId,
                    //referral_code: await userService.generateUniqueReferralCode(),
                    position // Assign position
                };
                console.log("subAccount request : " , subAccount);
                const insertedMemberId = await memberRepository.createSubAccount(subAccount, connection);

                secondLevelAccounts.push({
                    ...subAccount,
                    member_id: insertedMemberId,
                });
            }
            
            if (subaccount === 12) {
                let thirdLevelIndex = 4;

                for (const l2Account of secondLevelAccounts) {
                    for (let j = 0; j < 3; j++) {
                        let subUsername = `${l2Account.sub_username}-${String(thirdLevelIndex).padStart(2, "0")}`;
                        let position = positions[j]; // Assign position based on index
                        const existingAccount = await memberRepository.getMemberByUsername(subUsername);
                        if (existingAccount) {
                            throw new Error(`Subaccount ${subUsername} already exists.`);
                        }

                        const thirdLevelAccount = {
                            sub_username: subUsername,
                            account_type: "sub",
                            level: 3,
                            parent_id: l2Account.member_id,
                            user_id: userId,
                            //referral_code: await userService.generateUniqueReferralCode(),
                            position // Assign position
                        };

                        const insertedThirdLevelId = await memberRepository.createSubAccount(thirdLevelAccount, connection);

                        thirdLevelAccounts.push({
                            ...thirdLevelAccount,
                            member_id: insertedThirdLevelId,
                        });

                        thirdLevelIndex++;
                    }
                }
                generatedAccounts = [...generatedAccounts, ...secondLevelAccounts, ...thirdLevelAccounts];
            } else {
                generatedAccounts = [...generatedAccounts, ...secondLevelAccounts];
            }
            console.log("generatedAccounts : ", generatedAccounts);
        }
            
        // Create wallets for each account
        for (const account of generatedAccounts) {
            const accountId = account.member_id; // Ensure correct member_id from DB
            if (account.account_type === "master") {
                await walletRepository.createWallet(accountId, account.sub_username, [1, 2, 3, 4, 5, 6], connection); // USDT, AP, Shopping, Rebate, Pending , RV
            } else {
                await walletRepository.createWallet(accountId, account.sub_username, [4, 5, 6], connection); // Rebate, Pending , RV
            }
        }

        await connection.commit();
        connection.release();

        // Start a new transaction for crediting wallets
        const creditConnection = await db.getConnection();
        await creditConnection.beginTransaction();

        try {
            // Credit Shopping Points
            if (shopping_point > 0) {
                await walletRepository.creditWallet(memberId, 3, shopping_point, creditConnection);
                await transactionRepository.createTransaction(memberId, "CREDIT", "Shopping Point", 3, shopping_point, "Shopping Points from Package Purchase", creditConnection);
            }

            

            // Credit Rebate Points by scheduler and credit 0.125 per day
            const totalAccounts = generatedAccounts.length;
            console.log("totalAccounts : " + totalAccounts);
            const rebatePointsPerAccount = totalAccounts > 0 ? total_points / totalAccounts : 0;
            console.log("rebatePointsPerAccount : " + rebatePointsPerAccount);
            for (const account of generatedAccounts) {
                console.log("account : " , account);
                //await walletRepository.creditWallet(account.member_id, 4, rebatePointsPerAccount, creditConnection);
                 // **Insert rebate point schedule**
                console.log("Trigger rebateRepository.logRebateCredit");
                await rebateRepository.logRebateCredit(account.member_id, userId, rebatePointsPerAccount, rebateCreditDaily, connection);
                await transactionRepository.createTransaction(account.member_id, "CREDIT", "Rebate Point schedule", 7, rebatePointsPerAccount, `Rebate Points for ${account.sub_username}`, creditConnection);
            }

            // Generate BEP20 wallet addresses for the new member
            const { publicAddress, privateAddress } = createBep20Address();
           
            // Store the generated address into usdt_wallet_addresses table
            console.log("Trigger usdtWalletRepository.createWalletAddress");
            await usdtWalletRepository.createWalletAddress(memberId, publicAddress, privateAddress, creditConnection);

            // Update user status to active
            console.log("Trigger userRepository.updateUserStatus");
            await userRepository.updateUserStatus(userId, 1, packageId, creditConnection);
           
            await creditConnection.commit();
            creditConnection.release();

            // Push referral bonus processing to queue
            bonusQueue.add('referralBonus', {
                memberId, 
                sponsorId, 
                packageId, 
                username
            });
            console.log(`Referral bonus for member ${memberId} pushed to queue`);
            return { code: "S003", message: `Successful purchase package ${package_name} for member ${username}` };
        } catch (creditError) {
            await creditConnection.rollback();
            creditConnection.release();
            console.error("Error crediting points:", creditError);
            return { code: "E002", message: "Wallet crediting failed after package purchase.", error: creditError.message };
        }
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error purchasing package:", error);
        return { code: "E001", message: "Package purchase failed.", error: error.message };
    }
};

const placeMember = async (memberId, parentId, position) => {
    console.log("placeMember : " , memberId, parentId, position);
    try {
        // Validate if sponsor exists
        const parent = await memberRepository.getMemberById(parentId);
        if (!parent) {
            throw new Error(`Member Id ${parentId} not found !`);
        } else {
            console.log(`member id ${parentId} found !`);
        }

        // Validate if member exists
        const member = await memberRepository.getMemberById(memberId);
        if (!member){
            throw new Error(`Member Id ${parentId} not found !`);
        } else {
            console.log(`member id ${memberId} found !`);
        }

        // Validate if position is available
        console.log(`trigger memberRepository.checkPositionAvailability`);
        const isPositionAvailable = await memberRepository.checkPositionAvailability(parentId, position);
        if (!isPositionAvailable) {
            throw new Error("Position already occupied.");
        } else {
            console.log(`Position available for member ${memberId}`);
        }

        // ✅ Update `parent_id` in members table
        console.log(`trigger memberRepository.updateParentId`);
        await memberRepository.updateParentId(memberId, position, parentId);
        // Push matching bonus processing to queue
        bonusQueue.add('matchingBonus', {memberId});
        console.log(`Matching bonus for member ${memberId} pushed to queue`);

        return { code: "S002", message: `Member ${memberId} has placed successfully` };
    } catch (error) {
        console.error("Error placing member:", error);
        return { code: "E004", message: "Placement failed", error: error.message };
    }
};

const getPlacementTree = async (memberId, level) => {
    if (level === 0) return null; // Stop recursion at level 3

    const children = await memberRepository.getChildren(memberId);

    for (const child of children) {
        child.children = await getPlacementTree(child.id, level - 1);
    }

    return {
        memberId,
        children
    };
};

const getMemberPlacementNetwork = async (memberId) => {
    const memberDetails = await memberRepository.getMemberDetails(memberId);
    if (!memberDetails) {
        return {
            code: "E001",
            message: "Member not found",
            data: null
        };
    }

    const children = await getPlacementTree(memberId, 3);

    return {
            memberId: memberDetails.id,
            username: memberDetails.username,
            reward_balance: memberDetails.reward_balance,
            reward_value: memberDetails.reward_value,
            parent_id: memberDetails.parent_id,
            children: children.children
    };
};

const repurchaseForMember = async (memberId, subMemberId, packageId) => {
    console.log(`repurchaseForMember for member ${memberId}`);
    console.log(`repurchaseForMember for subMemberId ${subMemberId}`);
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Get member account details
        const member = await memberRepository.getMemberById(memberId);
        let username = '';
        if (!member){
            throw new Error("Member account not found.");
        } else{
            const user = await userRepository.getUserById(member.user_id);
            username = user.username;
        }
        console.log(`member username : ${username}`);
        // Retrieve package details (fixed at 50 USDT)
        const packageDetail = await packageRepository.getPackageById(packageId);
        if (!packageDetail) throw new Error("Invalid package selected.");
        
        const { price, wallet_usdt, wallet_ap, usdt_percent, ap_percent, shopping_point } = packageDetail;

        // Calculate required amounts
        const usdtRequired = wallet_usdt ? (price * usdt_percent) / 100 : 0;
        const apRequired = wallet_ap ? (price * ap_percent) / 100 : 0;

        // Check wallet balances
        const masterWallets = await walletRepository.getWalletsByMemberId(memberId, connection);
        const usdtWallet = masterWallets.find(w => w.wallet_type_id === 1);
        const apWallet = masterWallets.find(w => w.wallet_type_id === 2);
        console.log("USDT Amount : " , usdtRequired);
        console.log("Activation Point Amount : " , apWallet.balance);
        console.log("USDT wallet balance : " , apRequired);
        console.log("Activation Point wallet balance : " , apWallet.balance);
        if (wallet_usdt && (!usdtWallet || usdtWallet.balance < usdtRequired)) {
            throw new Error("Insufficient USDT balance.");
        }
        if (wallet_ap && (!apWallet || apWallet.balance < apRequired)) {
            throw new Error("Insufficient AP balance.");
        }

        // Deduct wallet balances
        if (wallet_usdt) {
            await walletRepository.updateWalletBalance(usdtWallet.wallet_id, usdtWallet.balance - usdtRequired, connection);
            await transactionRepository.createTransaction(memberId, "DEBIT", `Repurchase Package`, 1, usdtRequired, "Repurchase (USDT)", connection);
        }
        if (wallet_ap) {
            await walletRepository.updateWalletBalance(apWallet.wallet_id, apWallet.balance - apRequired, connection);
            await transactionRepository.createTransaction(memberId, "DEBIT", `Repurchase Package`, 2, apRequired, "Repurchase (AP)", connection);
        }

        // Find available placement (auto-random)
        const availablePosition = await memberRepository.getAvailablePosition(memberId, connection);
        console.log("availablePosition : " , availablePosition)
        // Validate if position is available
        console.log(`trigger memberRepository.checkPositionAvailability`);
        const isPositionAvailable = await memberRepository.checkPositionAvailability(availablePosition.parentId, availablePosition.position);
        if (!isPositionAvailable) {
            throw new Error("Position already occupied.");
        } else {
            console.log(`Position available for member ${memberId}`);
        }
        // Generate new sub-account username
        const newSubUsername = await getNextSubaccountUsername(member.user_id,username,connection)
        console.log("new SubUsername : ", newSubUsername);
        // Create new sub-account
        const newSubAccount = {
            user_id: parseInt(member.user_id, 10),
            parent_id: availablePosition.parentId,
            sub_username: newSubUsername.newUsername,
            account_type: "sub",
            account_layer: newSubUsername.nextLevel,
            position: availablePosition.position,
            //referral_code: await userService.generateUniqueReferralCode(),
            status_id: 1 // Active status
        };
        console.log("newSubAccount : " , newSubAccount );
        const newSubAccountId = await memberRepository.createSubAccount(newSubAccount, connection);
        console.log("newSubAccount id : " , newSubAccountId);
        // Create wallets for new sub-account
        await walletRepository.createWallet(newSubAccountId, newSubUsername.newUsername, [4, 5, 6], connection); 
        // Credit Shopping & Rebate Points,Reward Value to wallet
        await walletRepository.creditWallet(memberId, 3, 50, connection);
        await transactionRepository.createTransaction(memberId, "CREDIT", "Shopping Point", 3, 50, "Shopping Points from Repurchase", connection);
        
        // Commit transaction
        await connection.commit();
        connection.release();
        
        // Start a new transaction for crediting wallets
        const creditConnection = await db.getConnection();
        await creditConnection.beginTransaction();
        //credit rebate point to new sub account
        await walletRepository.creditWallet(newSubAccountId, 4, 50, creditConnection);
        await transactionRepository.createTransaction(newSubAccountId, "CREDIT", "Rebate Point", 4, 50, "Rebate Points from Repurchase for new sub account", creditConnection);
        //repurchase for master member if subMemberId is empty
        if(subMemberId === '') {
            // credit RV points (existing + 150) for master member
            await walletRepository.creditWallet(memberId, 6, 150, connection);
            await transactionRepository.createTransaction(memberId, "CREDIT", "Reward Value", 6, 150, "Reward Value from Repurchase for master account", creditConnection);
        } else{
            // crefit RV points (existing + 150) for sub member
            await walletRepository.creditWallet(subMemberId, 6, 150, creditConnection);
            await transactionRepository.createTransaction(subMemberId, "CREDIT", "Reward Value", 6, 150, "Reward Value from Repurchase for subaccount", creditConnection);
            // credit RV points 150 for new sub member
            await walletRepository.creditWallet(newSubAccountId, 6, 150, creditConnection);
            await transactionRepository.createTransaction(newSubAccountId, "CREDIT", "Reward Value", 6, 150, "Reward Value from Repurchase for new subaccount", creditConnection);
        }

        // Commit transaction
        await creditConnection.commit();
        creditConnection.release();

        //return { code: "S004", message: `Repurchase successful. New sub-account created: ${newSubUsername}` };
        return {
            success: true,
            message: `Repurchase successful. New sub-account created: ${newSubUsername.newUsername}`,
            newSubAccountId,
            newSubUsername: newSubUsername.newUsername
        };
       
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Error in repurchase:", error);
        return {
            success: false,
            message: "Repurchase failed.",
            error: error.message
        };
    }
};
async function getNextSubaccountUsername(memberId, baseUsername, connection) {
    // Get all subaccounts under this member
    const subaccounts = await memberRepository.getDirectSubaccounts(memberId, connection);
    console.log("Total Subaccounts: " + subaccounts.length);

    // If no subaccounts exist, start from baseUsername-01
    if (subaccounts.length === 0) {
        return {
            newUsername: `${baseUsername}-01`,
            nextLevel: 2 // Master account is Level 1, first subaccount is Level 2
        };
    }

    let subNumbers = [];
    let deepestLevel = 1; // Default level for master account

    for (let sub of subaccounts) {
        if (!sub || !sub.sub_username) {
            console.warn(`Skipping invalid subaccount entry:`, sub);
            continue; // Skip if subaccount is undefined or missing sub_username
        }

        let regex = new RegExp(`^${baseUsername}-(\\d+)$`); // Match dynamic baseUsername
        let match = sub.sub_username.match(regex);
        console.log("match : " + match);
        if (match) {
            subNumbers.push(parseInt(match[1]));
        }

        // Update deepest level if subaccount has a higher level
        if (sub.account_layer > deepestLevel) {
            deepestLevel = sub.account_layer;
        }
    }

    // Determine the next available subaccount number
    let nextNumber = subNumbers.length > 0 ? Math.max(...subNumbers) + 1 : 1;
    console.log("nextNumber : " + nextNumber);
    return {
        newUsername: `${baseUsername}-${String(nextNumber).padStart(2, "0")}`,
        nextLevel: deepestLevel + 1 // Next level after the deepest existing subaccount
    };
}







module.exports = {
    registerMember,
    getAllMembers,
    getMemberById,
    updateMember,
    getDownline,
    getSponsor,
    getFirstLevelMembers, 
    getChildrenMembers,
    getDownlineTree,
    searchDownline,
    purchasePackageForMember,
    placeMember,
    getMemberPlacementNetwork,
    repurchaseForMember,
    getAllAccounts
};
