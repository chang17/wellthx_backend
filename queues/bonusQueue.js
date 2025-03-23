const Queue = require('bull');
const bonusWorker = require('./bonusWorker');

const bonusQueue = new Queue('bonusQueue', {
    redis: { host: '127.0.0.1', port: 6379 }
});

// Process Referral Bonus
bonusQueue.process('referralBonus', async (job, done) => {
    try {
        await bonusWorker.processReferralBonus(job.data);
        done();
    } catch (error) {
        console.error('Referral Bonus processing failed:', error);
        done(error);
    }
});

// Process Matching Bonus
bonusQueue.process('matchingBonus', async (job, done) => {
    try {
        await bonusWorker.processMatchingBonus(job.data);
        done();
    } catch (error) {
        console.error('Matching Bonus processing failed:', error);
        done(error);
    }
});
// Retry failed jobs
bonusQueue.on('failed', (job, err) => {
    console.error(`Job failed for member ${job.data.memberId}: ${err.message}`);
});

module.exports = bonusQueue;
