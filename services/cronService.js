require("dotenv").config();
const cron = require("node-cron");
const { processPendingBonuses } = require("./bonusService");
const rebateService = require("./rebateService");

const bonusCronSchedule = process.env.BONUS_CRON_SCHEDULE || "1 0 * * *"; // Default: 12:01 AM
const rebateCronSchedule = process.env.REBATE_CRON_SCHEDULE || "0 2 * * *"; // Default: 2 AM
const timeZone = process.env.TIMEZONE || "Asia/Kuala_Lumpur"; // Default Timezone

// Cron Job for processing pending bonuses (Runs Daily at 12:01 AM)
cron.schedule(bonusCronSchedule, async () => {
    console.log(`[CRON] Triggering processPendingBonuses at ${bonusCronSchedule}...`);
    try {
        await processPendingBonuses();
        console.log("[CRON] processPendingBonuses completed successfully.");
    } catch (error) {
        console.error("[CRON ERROR] processPendingBonuses failed:", error);
    }
}, { timezone: timeZone });

// Cron Job for daily rebate credit (Runs Daily at 2 AM)
cron.schedule(rebateCronSchedule, async () => {
    console.log(`[CRON] Starting daily rebate credit process at ${rebateCronSchedule}...`);
    try {
        await rebateService.creditDailyRebate();
        console.log("[CRON] Daily rebate credit completed successfully.");
    } catch (error) {
        console.error("[CRON ERROR] Daily rebate credit job failed:", error);
    }
}, { timezone: timeZone });

console.log(`[INFO] Cron jobs scheduled with bonus: ${bonusCronSchedule}, rebate: ${rebateCronSchedule}, timezone: ${timeZone}`);
