const bonusService = require('../services/bonusService');

async function processBonus(jobData) {
    const { memberId, sponsorId, packageId, username } = jobData;

    // Process Referral Bonus
    await bonusService.processReferralBonus(memberId, sponsorId, packageId, username);

    // Process Matching Bonus
    await bonusService.processMatchingBonus(memberId, packageId, username);
}

/**
 * Process Referral Bonus - Calls bonusService.processReferralBonus
 */
async function processReferralBonus(jobData) {
    console.log("processReferralBonus " , jobData);
    try {
        const { memberId, sponsorId, packageId, username } = jobData;
        console.log(`Processing Referral Bonus for Member ID: ${memberId}`);

        await bonusService.processReferralBonus(memberId, sponsorId, packageId, username);

        console.log(`Referral Bonus successfully processed for Member ID: ${memberId}`);
    } catch (error) {
        console.error(`Error processing Referral Bonus for Member ID: ${jobData.memberId}`, error);
        throw error;
    }
}

/**
 * Process Matching Bonus - Calls bonusService.processMatchingBonus
 */
async function processMatchingBonus(jobData) {
    console.log("processMatchingBonus " , jobData);
    try {
        const { memberId } = jobData;
        console.log(`Processing Matching Bonus for Member ID: ${memberId}`);

        await bonusService.processMatchingBonus(memberId);

        console.log(`Matching Bonus successfully processed for Member ID: ${memberId}`);
    } catch (error) {
        console.error(`Error processing Matching Bonus for Member ID: ${jobData.memberId}`, error);
        throw error;
    }
}

module.exports = {
    processBonus,
    processReferralBonus,
    processMatchingBonus
};
