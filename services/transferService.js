const transferRepository = require("../repositories/transferRepository");
const transactionRepository = require("../repositories/transactionRepository");
const db = require("../config/dbConfig");

const transferPoints = async (senderId, receiverId, walletTypeId, amount) => {
    console.log("transferPoints : " , senderId , receiverId , walletTypeId, amount);
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Step 1: Validate direct sponsor relationship
        console.log("trigger transferRepository.checkDirectRelationship");
        const isDirectRelation = await transferRepository.checkDirectRelationship(senderId, receiverId, connection);
        console.log("isDirectRelation : " , isDirectRelation);
        if (!isDirectRelation) {
            throw new Error("Transfer failed: Receiver is not in direct sponsor-downline relationship.");
        }

        // Step 2: Check sender's wallet balance
        console.log("trigger transferRepository.getWalletBalance");
        const senderWallet = await transferRepository.getWalletBalance(senderId, walletTypeId, connection);
        const senderBalance = parseFloat(senderWallet.balance);
        const transferAmount = parseFloat(amount);
        console.log("senderWallet balance: " + senderWallet.balance);
        console.log("amount : " + amount);
        if (!senderWallet || senderBalance < transferAmount) {
            throw new Error("Transfer failed: Insufficient balance.");
        }

        // Step 3: Check if receiver has wallet, create if not
        console.log("trigger transferRepository.getWalletBalance");
        let receiverWallet = await transferRepository.getWalletBalance(receiverId, walletTypeId, connection);
        if(!receiverWallet){
            return { code: "E005", message: `Wallet not available for member ${receiverId}` };
        }
        console.log("receiver Wallet : " , receiverWallet);
        //return error if receiver don't have wallet

        // Step 4: Transfer funds (Deduct from sender, Credit to receiver)
        console.log("trigger transferRepository.updateWalletBalance");
        await transferRepository.updateWalletBalance(senderId, walletTypeId, -transferAmount, connection);
        await transactionRepository.createTransaction(senderId, "DEBIT", `Transfer`, walletTypeId, amount, `member ${senderId} transfer ${amount} to member ${receiverId}`, connection);
        console.log("trigger transferRepository.updateWalletBalance");
        await transferRepository.updateWalletBalance(receiverId, walletTypeId, transferAmount, connection);
        await transactionRepository.createTransaction(receiverId, "CREDIT", `Transfer`, walletTypeId, amount, `member ${receiverId} receive ${amount} from member ${senderId}`, connection);
        
        // Step 5: Log transaction
        //await transferRepository.logWalletTransaction(senderId, receiverId, walletTypeId, amount, connection);

        await connection.commit();
        return { success: true, message: "Transfer successful." };
    } catch (error) {
        await connection.rollback();
        console.error("Transfer Error:", error);
        return { success: false, message: error.message };
    } finally {
        connection.release();
    }
};

module.exports = { transferPoints };
