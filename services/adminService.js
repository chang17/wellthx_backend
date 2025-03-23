const adminRepository = require('../repositories/adminRepository');
const { web3, usdtContract } = require("../config/web3Config");
const depositRepository = require("../repositories/depositRepository");
const walletRepository = require("../repositories/walletRepository");

const getAllUsers = async () => {
    return await adminRepository.getAllUsers();
};

const updateUserStatus = async (userId, status) => {
    return await adminRepository.updateUserStatus(userId, status);
};

const getAllTransactions = async () => {
    return await adminRepository.getAllTransactions();
};

const getPendingDeposits = async () => {
    return await adminRepository.getPendingDeposits();
};



async function hasSufficientGas(publicAddress) {
    const gasPrice = await web3.eth.getGasPrice();
    const balance = await web3.eth.getBalance(publicAddress);
    return web3.utils.toBN(balance).gte(web3.utils.toBN(gasPrice).mul(web3.utils.toBN(21000)));
}

/**
 * 
 * @param {*} transactionId 
 * @returns 
 * 1. Find the deposit record in the database using transactionId.
 * 2. Extract the member's USDT wallet address and deposit amount.
 * 3. Retrieve the private key for the member’s wallet from walletRepository.
 * 4. Check if the sender has enough BNB for gas fees.
 * 5. Create a transaction to transfer the deposit amount from the member's USDT wallet → company's public wallet (COMPANY_PUBLIC_ADDRESS).
 * 6. Sign and broadcast the transaction.
 * 7. If successful, update the database:
 *      - Mark deposit as completed.
 *      - Update the user's wallet balance.
 */
async function processDeposit(transactionId) {
    const deposits = await depositRepository.getPendingDeposits();
    const deposit = deposits.find(d => d.transaction_id === transactionId);

    if (!deposit) throw new Error("No pending deposit found.");

    const { member_id, usdt_wallet_address, deposit_amount } = deposit;
    const privateKey = await walletRepository.getWalletPrivateKey(usdt_wallet_address);

    if (!privateKey) throw new Error("Private key not found for address.");

    if (!(await hasSufficientGas(usdt_wallet_address))) {
        throw new Error("Insufficient BNB for gas fee.");
    }

    const sender = web3.eth.accounts.privateKeyToAccount(privateKey);
    const nonce = await web3.eth.getTransactionCount(sender.address, "pending"); // Use 'pending'

    const transferData = usdtContract.methods.transfer(
        process.env.COMPANY_PUBLIC_ADDRESS,
        web3.utils.toWei(deposit_amount.toString(), "mwei") // Correct decimal for USDT
    ).encodeABI();

    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
        from: sender.address,
        to: process.env.USDT_CONTRACT_ADDRESS,
        data: transferData,
        gas: await web3.eth.estimateGas({ from: sender.address, to: process.env.USDT_CONTRACT_ADDRESS, data: transferData }),
        gasPrice,
        nonce
    };

    const signedTx = await sender.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    if (receipt.status) {
        await depositRepository.markDepositCompleted(transactionId);
        await walletRepository.updateUserWalletBalance(member_id, deposit_amount);
        return { success: true, txHash: receipt.transactionHash };
    } else {
        throw new Error("Transfer failed.");
    }
}

/**
 * 
 * @param {*} transactionId 
 * @returns 
 * 🔹 Function Flow (Company → Customer)
 * Retrieve withdrawal request using transactionId.
 * Get the company’s private key (used to sign transactions).
 * Check if the company has enough USDT in the wallet.
 * Check if the company has enough BNB to cover the gas fee.
 * Create a USDT transfer transaction (COMPANY_PUBLIC_ADDRESS → customer_address).
 * Sign and send the transaction.
 * Update the database after a successful transaction.
 * 🔥 Improvements & Best Practices
 * ✅ Ensures company has enough USDT before sending.
 * ✅ Prevents nonce conflicts by using "pending".
 * ✅ Checks if the company has enough BNB for gas fees.
 * ✅ Handles transaction failures & updates the database.
 */
async function processWithdrawal(transactionId) {
    const withdrawals = await withdrawalRepository.getPendingWithdrawals();
    const withdrawal = withdrawals.find(w => w.transaction_id === transactionId);

    if (!withdrawal) throw new Error("No pending withdrawal found.");

    const { member_id, customer_address, withdrawal_amount } = withdrawal;
    const companyPrivateKey = process.env.COMPANY_PRIVATE_KEY;
    const companyAddress = process.env.COMPANY_PUBLIC_ADDRESS;

    if (!companyPrivateKey) throw new Error("Company private key is missing.");

    // Check if company has enough USDT balance
    const companyBalance = await usdtContract.methods.balanceOf(companyAddress).call();
    if (BigInt(companyBalance) < BigInt(web3.utils.toWei(withdrawal_amount.toString(), "mwei"))) {
        throw new Error("Insufficient USDT balance in company account.");
    }

    // Check if company has enough BNB for gas fees
    if (!(await hasSufficientGas(companyAddress))) {
        throw new Error("Insufficient BNB for gas fees.");
    }

    const sender = web3.eth.accounts.privateKeyToAccount(companyPrivateKey);
    const nonce = await web3.eth.getTransactionCount(sender.address, "pending"); // Use 'pending' to avoid nonce conflicts

    // USDT transfer transaction
    const transferData = usdtContract.methods.transfer(
        customer_address,
        web3.utils.toWei(withdrawal_amount.toString(), "mwei") // USDT uses 6 decimals
    ).encodeABI();

    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
        from: sender.address,
        to: process.env.USDT_CONTRACT_ADDRESS,
        data: transferData,
        gas: await web3.eth.estimateGas({ from: sender.address, to: process.env.USDT_CONTRACT_ADDRESS, data: transferData }),
        gasPrice,
        nonce
    };

    const signedTx = await sender.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    if (receipt.status) {
        await withdrawalRepository.markWithdrawalCompleted(transactionId);
        return { success: true, txHash: receipt.transactionHash };
    } else {
        throw new Error("Withdrawal transaction failed.");
    }
}




module.exports = { getAllUsers, updateUserStatus, getAllTransactions,getPendingDeposits, processDeposit, processWithdrawal};