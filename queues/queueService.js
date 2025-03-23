const bonusQueue = require('./bonusQueue');

async function pushBonusToQueue({ memberId, sponsorId, packageId, username }) {
    await bonusQueue.add({ 
        memberId, 
        sponsorId, 
        packageId, 
        username 
    }, { attempts: 3, backoff: [5000, 10000, 20000] });
}

module.exports = { pushBonusToQueue };
