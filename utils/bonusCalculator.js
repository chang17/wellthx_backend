const referralBonusRates = {
    bronze: 5,
    silver: 20,
    gold: 65
};

const levelBonusRates = [1.5, 9, 40.5, 162, 607.5, 2187, 7654.5, 26244, 88573.5, 295245];

const rebatePointsRates = {
    bronze: 50,
    silver: 300,
    gold: 1950
};

const calculateReferralBonus = (packageName) => {
    return referralBonusRates[packageName] || 0;
};

const calculateLevelBonus = (level) => {
    return level <= levelBonusRates.length ? levelBonusRates[level - 1] : 0;
};

const calculateRebatePoints = (packageName) => {
    return rebatePointsRates[packageName] || 0;
};

module.exports = { calculateReferralBonus, calculateLevelBonus, calculateRebatePoints };