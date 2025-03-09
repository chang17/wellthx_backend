const adminService = require('../services/adminService');

const getAllUsers = async (req, res) => {
    try {
        const users = await adminService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await adminService.updateUserStatus(id, status);
        res.json({ message: 'User status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const transactions = await adminService.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllUsers, updateUserStatus, getAllTransactions };