const walletRepository = require("../repositories/walletRepository");
const settingRepository = require("../repositories/settingRepository");
const transactionRepository = require("../repositories/transactionRepository");
const rebateRepository = require("../repositories/rebateRepository");
const db = require('../config/dbConfig');

// Convert Rebate Points to AP Points (Activation Points)
const convertRebateToAP = async (memberId, userId, amount) => {
    console.log("convertRebateToAP : ", memberId, userId , amount);
    const connection = await db.getConnection(); // Get DB connection
    try {
        console.log("🔄 Starting conversion process...");
        await connection.beginTransaction(); // Start transaction

        // Get minimum conversion limit from settings
        const minLimit = await settingRepository.getSettingValueByKeyName("min_conversion_limit");
        console.log("minLimit : ", minLimit);
        if (amount < minLimit) {
            throw new Error(`Minimum conversion limit is ${minLimit}`);
        }

        // Ensure amount is at least the minimum limit
        if (amount < minLimit) {
            throw new Error(`Minimum conversion limit is ${minLimit}`);
        }

         // Ensure amount is a multiple of min_limit
         if (amount % minLimit !== 0) {
            throw new Error(`Amount must be a multiple of ${minLimit}`);
        }

        // Fetch all active rebate records for the member
        const rebateRecords = await rebateRepository.getActiveRebateRecordsByUserId(userId, connection);
        console.log("rebateRecords : ", rebateRecords);

        if (!rebateRecords.length) {
            throw new Error("No active rebate records found.");
        }

        // Convert `remaining_rebate` to a number before summing
        const totalRebatePoints = rebateRecords.reduce((sum, record) => sum + parseFloat(record.remaining_rebate), 0);
        console.log("Total Rebate Points:", totalRebatePoints);


        if (totalRebatePoints < amount) {
            throw new Error("Insufficient rebate points.");
        }
        // Deduct amount from total rebate points
        //const remainingBalance = totalRebatePoints - amount;

        // Ensure there are records to divide by
        if (rebateRecords.length === 0) {
            throw new Error("No rebate records found to update.");
        }

        // Calculate the new balance per record (rounded to 3 decimal places)
        //const newBalancePerRecord = parseFloat((remainingBalance / rebateRecords.length).toFixed(3));
        //console.log(`New balance per record (rounded to 3 decimal places): ${newBalancePerRecord}`);
        const debitAmount = parseFloat((amount / rebateRecords.length).toFixed(3));
        console.log(`Debit per record (rounded to 3 decimal places): ${debitAmount}`);
        // Fetch Activation Wallet
        const apWallet = await walletRepository.getActivationWalletsByMemberId(memberId);
        console.log("apWallet : ", apWallet);
        if (!apWallet) {
            throw new Error("Activation Point Wallet not found.");
        }

        // Update each rebate record with new balance
        for (const record of rebateRecords) {
            console.log("record : " , record);
            const rebateBalance = (parseFloat(record.remaining_rebate) - debitAmount).toFixed(3)
            await rebateRepository.updateRebateBalance(record.id, rebateBalance, connection);
            // Insert Transaction
            await transactionRepository.insertTransaction(record.member_id, "DEBIT","Rebate Point Schedule", 7, debitAmount, `Debit ${debitAmount} from Rebate Point Schedule.Current balance is ${rebateBalance}`);
            //Check if rebateBalance is 0 or 0.00 then update status to INACTIVE
            if (rebateBalance === 0) {
                console.log(`Rebate balance is 0 for wallet_id: ${record.wallet_id}. Setting status to INACTIVE.`);
                await rebateRepository.setRebateScheduleInactive(record.wallet_id, connection);
            }
        }
        
        const creditAmount = parseFloat(apWallet.balance) + amount;
        console.log("apWallet id : " + apWallet.wallet_id);
        console.log("apwallet balance : " + creditAmount);
        await walletRepository.updateWalletBalance(apWallet.wallet_id, creditAmount, connection);
        // Insert Transaction
        await transactionRepository.insertTransaction(memberId, "CREDIT","Activation Point", 2, amount, `Credit conversion amount ${amount} to Activation Point wallet and current balance is ${creditAmount}.`);
        
        await connection.commit();
        connection.release();

        return { code: "S001", message: `Successful convert ${amount} to Activation Point.` };
    } catch (error) {
        await connection.rollback(); // Rollback transaction in case of an error
        console.error("❌ Error convert Rebate credit to Activation Point, transaction rolled back:", error);
        return { code: "E009", message: "Conversion Failure,", error: error.message};
    } finally {
        connection.release(); // Release connection
    }
};

module.exports = { convertRebateToAP };
