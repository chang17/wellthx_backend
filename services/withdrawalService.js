const withdrawalRepository = require("../repositories/withdrawalRepository");
const walletRepository = require("../repositories/walletRepository");
const blockchainService = require("../services/blockchainService");

const withdrawalService = {
    async requestWithdrawal(memberId, publicAddress, amount) {
        console.log("requestWithdrawal from member " + memberId + " with amount " + amount) ;
        const wallets = await walletRepository.getUSDTWalletsByMemberId(memberId);
        const usdtWallet = wallets.find(w => w.wallet_type_id === 1);
        const walletBalance = parseFloat(usdtWallet.balance);
        const withdrawAmount = parseFloat(amount);
        console.log("usdtWallet balance " + walletBalance) ;
        if (walletBalance < withdrawAmount) {
            throw new Error("Insufficient balance for withdrawal.");
        }
        console.log("withdrawalRepository.createWithdrawal"); 
        const withdrawalId = await withdrawalRepository.createWithdrawal(memberId, publicAddress, withdrawAmount);

        await walletRepository.debitUSDTWallet(memberId, withdrawAmount);

        return { withdrawalId, status: "pending" };
    },

    async cancelWithdrawal(withdrawalId, memberId) {
        console.log("cancelWithdrawal : " ,withdrawalId , memberId );
        const transaction = await withdrawalRepository.getWithdrawalById(withdrawalId);
        console.log("cancelWithdrawal : " , transaction);
        if (!transaction || transaction.member_id !== memberId || transaction.status !== "pending") {
            throw new Error("Invalid transaction or cannot be canceled.");
        }
        await walletRepository.creditUSDTWallet(memberId, transaction.amount);
        await withdrawalRepository.cancelWithdrawal(withdrawalId, memberId);

        return { message: "Withdrawal canceled successfully." };
    },

    async getWithdrawalsByMember(memberId) {
        console.log("getWithdrawalsByMemberId " , memberId);
        try {
            const result = await withdrawalRepository.getWithdrawalsByMember(memberId);
            console.log("Result : " , result);
            return result;
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async processWithdrawals() {
        console.log("Starting processWithdrawals");
    
        // Fetch all pending withdrawals
        const pendingWithdrawals = await withdrawalRepository.getPendingWithdrawals();
        console.log("Total pending withdrawals:", pendingWithdrawals.length);
    
        // Store results of processed transactions
        const processedTransactions = [];
    
        for (const withdrawal of pendingWithdrawals) {
            try {
                console.log(`Processing withdrawal ID: ${withdrawal.withdrawal_id}`);
    
                // Simulate blockchain transaction (replace with actual blockchain service when enabled)
                const txHash = "12345"; // Example static transaction hash
                // const txHash = await blockchainService.sendUSDT(withdrawal.public_address, withdrawal.amount);
    
                console.log(`Transaction hash: ${txHash}`);
    
                // Update withdrawal status to confirmed
                await withdrawalRepository.updateWithdrawalStatus(withdrawal.withdrawal_id, "confirmed");
                console.log(`Updated withdrawal ID ${withdrawal.withdrawal_id} to 'confirmed'`);
    
                // Store success transaction
                processedTransactions.push({
                    withdrawalId: withdrawal.withdrawal_id,
                    status: "confirmed",
                    txHash,
                });
    
            } catch (error) {
                console.error(`Error processing withdrawal ID ${withdrawal.withdrawal_id}:`, error);
    
                // Update transaction status to failed
                await withdrawalRepository.updateWithdrawalStatus(withdrawal.withdrawal_id, "failed");
                console.log(`Updated withdrawal ID ${withdrawal.withdrawal_id} to 'failed'`);
    
                // Credit back the amount to member's USDT wallet
                await walletRepository.creditUSDTWallet(withdrawal.member_id, withdrawal.amount);
                console.log(`Credited back ${withdrawal.amount} USDT to member ID ${withdrawal.member_id}`);
    
                // Store failed transaction
                processedTransactions.push({
                    withdrawalId: withdrawal.withdrawal_id,
                    status: "failed",
                    error: error.message,
                });
            }
        }
    
        console.log("processWithdrawals completed.");
        return processedTransactions;
    },
    

    async getWithdrawalHistory(memberId) {
        return await withdrawalRepository.getWithdrawalHistory(memberId);
    },
};

module.exports = withdrawalService;
