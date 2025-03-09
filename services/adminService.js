const adminRepository = require('../repositories/adminRepository');

const getAllUsers = async () => {
    return await adminRepository.getAllUsers();
};

const updateUserStatus = async (userId, status) => {
    return await adminRepository.updateUserStatus(userId, status);
};

const getAllTransactions = async () => {
    return await adminRepository.getAllTransactions();
};

module.exports = { getAllUsers, updateUserStatus, getAllTransactions };