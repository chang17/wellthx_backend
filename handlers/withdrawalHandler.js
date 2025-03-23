const withdrawalService = require("../services/withdrawalService");

const withdrawalHandler = {
    async requestWithdrawal(req, res) {
        try {
            const { memberId, publicAddress, amount } = req.body;
            const result = await withdrawalService.requestWithdrawal(memberId, publicAddress, amount);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async cancelWithdrawal(req, res) {
        try {
            const { withdrawalId, memberId } = req.body;
            const result = await withdrawalService.cancelWithdrawal(withdrawalId, memberId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async getWithdrawalsByMember(req, res) {
        try {
            const { memberId } = req.params;
            const result = await withdrawalService.getWithdrawalsByMember(memberId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async processWithdrawals(req, res) {
        try {
            const result = await withdrawalService.processWithdrawals();
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    async getWithdrawalHistory(req, res) {
        try {
            const { memberId } = req.params;
            const result = await withdrawalService.getWithdrawalHistory(memberId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};

module.exports = withdrawalHandler;
