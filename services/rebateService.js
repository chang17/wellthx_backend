const rebateRepository = require("../repositories/rebateRepository");
const walletRepository = require("../repositories/walletRepository");
const transactionRepository = require("../repositories/transactionRepository");

const db = require("../config/dbConfig"); // Import database config

const creditDailyRebate = async () => {
    const connection = await db.getConnection(); // Get DB connection
    try {
        console.log("🔄 Starting daily rebate crediting process...");

        await connection.beginTransaction(); // Start transaction

        // Get all active rebate schedules
        const activeRebates = await rebateRepository.getActiveRebateSchedules(connection);
        console.log("activeRebates : " , activeRebates);
        for (const rebate of activeRebates) {
            const { member_id, wallet_id, remaining_rebate, daily_credit } = rebate;
            console.log("rebate : " , rebate);
            // Ensure rebate amount does not exceed remaining balance
            const creditAmount = Math.min(daily_credit, remaining_rebate);
            console.log("creditAmount : " , creditAmount);
            // Credit wallet
            await walletRepository.creditWallet(member_id, 4, creditAmount, connection);
            // Insert Transaction
            await transactionRepository.insertTransaction(member_id, "CREDIT","Rebate Point", 4, creditAmount, `Daily task credit ${daily_credit} to Rebate Point to wallet`);
     
            // Update remaining rebate
            await rebateRepository.updateRemainingRebate(wallet_id, creditAmount, connection);
     
            console.log(`✅ Credited ${creditAmount} to member ${member_id}'s rebate wallet.`);

            // If remaining rebate is now 0, mark the record as inactive
            if (remaining_rebate - creditAmount <= 0) {
                await rebateRepository.setRebateScheduleInactive(wallet_id, connection);
                console.log(`🔴 Rebate schedule for member ${member_id} is now inactive.`);
            }
        }

        await connection.commit(); // Commit transaction
        console.log("✅ Daily rebate credit process completed successfully.");
    } catch (error) {
        await connection.rollback(); // Rollback transaction in case of an error
        console.error("❌ Error processing daily rebate credit, transaction rolled back:", error);
    } finally {
        connection.release(); // Release connection
    }
};

module.exports = { creditDailyRebate };
