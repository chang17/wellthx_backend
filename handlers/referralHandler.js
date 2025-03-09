const referralService = require('../services/referralService');

const getUserReferrals = async (req, res) => {
    try {
        const referrals = await referralService.getUserReferrals(req.user.id);
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getUserReferrals };