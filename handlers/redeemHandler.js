const redeemService = require('../services/redeemService');

const createRedemption = async (req, res) => {
    try {
        const { memberId, productId, totalUnits, recipientName, address, postcode, state, country } = req.body;
        const response = await redeemService.createRedemption(memberId, productId, totalUnits, recipientName, address, postcode, state, country);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const cancelRedemption = async (req, res) => {
    try {
        const { redeemId } = req.params;
        const { memberId } = req.body;
        const response = await redeemService.cancelRedemption(redeemId, memberId);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getRedemptionList = async (req, res) => {
    try {
        const { status } = req.query; // Optional status filter
        const redemptionList = await redeemService.getRedemptionList(status);
        res.json(redemptionList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getRedemptionByMemberId = async (req, res) => {
    try {
        const { memberId } = req.body;
        const redemptionList = await redeemService.getRedemptionByMemberId(memberId);
        res.json(redemptionList);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// ✅ Approve Redemption
const approveRedemption = async (req, res) => {
    try {
        const { redemptionId } = req.params;
        await redeemService.approveRedemption(redemptionId);
        res.json({ message: "Redemption approved successfully", code: 200 });
    } catch (error) {
        res.status(400).json({ message: error.message, code: 400 });
    }
};

// ✅ Confirm Delivery (Add tracking details)
const confirmDelivery = async (req, res) => {
    try {
        const { redemptionId } = req.params;
        const { logisticCompany, trackingNumber, confirmedDate } = req.body;
        await redeemService.confirmDelivery(redemptionId, logisticCompany, trackingNumber, confirmedDate);
        res.json({ message: "Delivery confirmed successfully", code: 200 });
    } catch (error) {
        res.status(400).json({ message: error.message, code: 400 });
    }
};

// ✅ Mark as Delivered
const markAsDelivered = async (req, res) => {
    try {
        const { redemptionId } = req.params;
        const { deliveredDate } = req.body;
        await redeemService.markAsDelivered(redemptionId,deliveredDate);
        res.json({ message: "Redemption marked as delivered", code: 200 });
    } catch (error) {
        res.status(400).json({ message: error.message, code: 400 });
    }
};

module.exports = { 
    createRedemption,
    cancelRedemption,
    getRedemptionList,
    approveRedemption,
    confirmDelivery,
    markAsDelivered,
    getRedemptionByMemberId
 };


