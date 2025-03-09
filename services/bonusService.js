// Example: Bonus Service Update
// src/services/bonusService.js
const bonusRepository = require('../repositories/bonusRepository');
const walletRepository = require('../repositories/walletRepository');
const bonusCalculator = require('../utils/bonusCalculator');

const processReferralBonus = async (referrerId, packageName) => {
    const bonusAmount = bonusCalculator.calculateReferralBonus(packageName);
    await bonusRepository.addPendingBonus(referrerId, 'referral', bonusAmount);
};

const processLevelBonus = async (userId, level) => {
    const bonusAmount = bonusCalculator.calculateLevelBonus(level);
    await bonusRepository.addPendingBonus(userId, 'level', bonusAmount);
};

const processRebatePoints = async (userId, packageName) => {
    const points = bonusCalculator.calculateRebatePoints(packageName);
    await bonusRepository.addPendingBonus(userId, 'rebate', points);
};

const processPendingBonuses = async () => {
    const pendingBonuses = await bonusRepository.getPendingBonuses();
    
    for (const bonus of pendingBonuses) {
        try {
            await walletRepository.updateWalletBalance(bonus.user_id, bonus.amount);
            await bonusRepository.updateBonusStatus(bonus.id, 'completed');
        } catch (error) {
            await bonusRepository.updateBonusStatus(bonus.id, 'error', error.message);
        }
    }
};

module.exports = { processReferralBonus, processLevelBonus, processRebatePoints, processPendingBonuses };
