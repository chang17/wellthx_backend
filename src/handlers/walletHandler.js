const walletService = require('../services/walletService');

const getWalletBalance = async (req, res) => {
    try {
        const balance = await walletService.getWalletBalance(req.user.id);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getWalletBalance };