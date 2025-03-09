const walletRepository = require('../repositories/walletRepository');

const getWalletBalance = async (userId) => {
    return await walletRepository.getBalanceByUserId(userId);
};

module.exports = { getWalletBalance };