const referralRepository = require('../repositories/referralRepository');

const getUserReferrals = async (userId) => {
    return await referralRepository.getReferralsByUserId(userId);
};

module.exports = { getUserReferrals };