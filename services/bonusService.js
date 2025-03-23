const transactionRepository = require('../repositories/transactionRepository');
const bonusRepository = require('../repositories/bonusRepository');
const settingRepository = require('../repositories/settingRepository');
const packageRepository = require('../repositories/packageRepository');
const memberRepository = require('../repositories/memberRepository');


async function processReferralBonus(memberId, sponsorId, packageId, username) {
  console.log("processReferralBonus", memberId, sponsorId, packageId, username);
  try {
    console.log("Triggering packageRepository.getPackageById " , packageId);
    const packageDetail = await packageRepository.getPackageById(packageId);
    console.log("packageDetail : " ,  packageDetail);

    if (!packageDetail) {
      console.log("Invalid package");
      return;
    } 
    // Destructure packageDetail
    const {
      usdt_percent,
      ap_percent,
      referral_bonus
    } = packageDetail;
    // Calculate USDT & Activation Point amounts
    const usdtAmount = (referral_bonus * usdt_percent) / 100;
    const apAmount = (referral_bonus * ap_percent) / 100;
    console.log("Referral Bonus : " + referral_bonus);
    console.log("USDT Amount: " + usdtAmount);
    console.log("AP Amount : " + apAmount);
    // Insert record into Referral Bonus table
    console.log("Triggering bonusRepository.insertReferralBonus " , memberId,sponsorId,packageId,referral_bonus,usdtAmount,apAmount);
    const bid = await bonusRepository.insertReferralBonus(memberId,sponsorId,packageId,referral_bonus,usdtAmount,apAmount,`Referral Bonus ${referral_bonus} for member ${memberId}`);
    // Check RV balance
    console.log("Triggering bonusRepository.getRvBalance " , sponsorId);
    const rvBalance = await bonusRepository.getRvBalance(sponsorId);
    console.log("rvBalance : " , rvBalance);
    if (rvBalance < referral_bonus) {
      console.log("Triggering bonusRepository.updatePendingBonus " , sponsorId, username, referral_bonus);
      await bonusRepository.updatePendingBonus(sponsorId, username, 6, referral_bonus);
      console.log(`Referral bonus for ${sponsorId} is pending due to low RV.`);
      return;
    } else {
      console.log("Triggering bonusRepository.creditWallet " , sponsorId, usdtAmount);
      // Credit Sponsor USDT Wallet
      await bonusRepository.creditWallet(sponsorId, 1, usdtAmount);
      // Insert Transaction
      await transactionRepository.insertTransaction(sponsorId, "CREDIT","Referral Bonus", 1, usdtAmount, `Referral bonus ${usdtAmount} for ${sponsorId} to USDT wallet`);
      // Credit Sponsor Activation Point Wallet
      console.log("Triggering bonusRepository.creditWallet " , sponsorId, apAmount);
      await bonusRepository.creditWallet(sponsorId, 2, apAmount);
      // Insert Transaction
      await transactionRepository.insertTransaction(sponsorId, "CREDIT","Referral Bonus", 2, apAmount, `Referral bonus ${apAmount} for ${sponsorId} to Activation Point wallet`);
      // Update Referral Bonus Status
      console.log("Triggering bonusRepository.updateReferralBonusStatus " , bid, 'completed');
      await bonusRepository.updateReferralBonusStatus(bid, 'completed', false);
      // Debit Sponsor RV Wallet
      console.log("Triggering bonusRepository.debitWallet " , sponsorId, referral_bonus);
      await bonusRepository.debitWallet(sponsorId, 6, referral_bonus);  // RV wallet
      // Insert Transaction
      await transactionRepository.insertTransaction(sponsorId, "DEBIT","Reward Value", 6, referral_bonus, `Reward Value ${referral_bonus} for ${sponsorId} Reward Value Wallet`);
    }
  } catch (err) {
    console.error('Error processing referral bonus:', err.message);
  }
    
}

async function processMatchingBonus(memberId) {
    console.log("processMatchingBonus", memberId);
    const packageId = await memberRepository.getPackageById(memberId);
    console.log("packageId", packageId);
    const packageDetail = await packageRepository.getPackageById(packageId);
    if (!packageDetail) {
      console.log("Invalid package");
      throw new Error(`Invalid package ${packageId} !`)
    } else {
      console.log('packageDetail : ' , packageDetail);
    }
    const { price, usdt_percent, ap_percent } = packageDetail;
    const matchingLevels = await bonusRepository.getMatchingLevels();
    let currentMemberId = memberId;

    let topAccountId = null; // Store top account ID when needed
    let topAccountUsername = null; // Store top account username when needed
    for (let level of matchingLevels) {
      console.log("Trigger bonusRepository.getUplineParent ",currentMemberId);
      let parent = null;

      // If we haven't reached a missing parent yet, keep searching
      if (!topAccountId) {
        parent = await bonusRepository.getUplineParent(currentMemberId);
        console.log("parent : ", parent);
      }

      let recipientId;
      let recipientUsername;
      let isTopAccount = false;


      if (!parent) {
        if (!topAccountId) {
            // Fetch top account when no parent is found for the first time
            topAccountId = await settingRepository.getSettingValueByKeyName("top_account_no");
            topAccountUsername = await settingRepository.getSettingValueByKeyName("top_account_username");
            if (!topAccountId) {
                console.error("❌ Top account not configured. Cannot proceed with bonus distribution.");
                break;
            }
            console.log(`🔹 No parent found at Level ${level.level}. All bonuses from Level ${level.level} onwards will be credited to Top Account: ${topAccountId}`);
        }
        recipientId = topAccountId;
        recipientUsername = topAccountUsername;
        isTopAccount = true; // Mark as top account
      } else {
        recipientId = parent.parent_id;
        recipientUsername = parent.username;
      }
       
       
        const bonusAmount = (price * level.percent) / 100;
        const usdtAmount = (bonusAmount * usdt_percent) / 100;
        const apAmount = (bonusAmount * ap_percent) / 100;
        console.log("*******************************");
        console.log("recipientId : " + recipientId);
        console.log("recipientUsername : " + recipientUsername);
        console.log("level : " + level.level +" Matching Bonus : " + bonusAmount);
        console.log("USDT Amount: " + usdtAmount);
        console.log("AP Amount : " + apAmount);
        // Insert record into Matching Bonus table
        const bid = await bonusRepository.insertMatchingBonus(currentMemberId,recipientId,packageId,level.level,bonusAmount,usdtAmount,apAmount,`Matching Bonus ${bonusAmount} for member ${recipientId}`);
        console.log("Matching Bonus Txn : " + bid);
        console.log("*******************************");
         // Check RV balance (only if recipient is NOT top account)
        console.log("trigger bonusRepository.getRvBalance");
        const rvBalance = await bonusRepository.getRvBalance(recipientId);
        console.log("rvBalance : " + rvBalance);

        if (rvBalance < bonusAmount) {
            console.log("trigger bonusRepository.updatePendingBonus");
            await bonusRepository.updatePendingBonus(recipientId, recipientUsername, 5, bonusAmount);
            console.log(`Matching bonus for ${recipientId} is pending due to low RV.`);
            return;
        } else {
          // Credit Upline USDT Wallets
          console.log("trigger bonusRepository.creditWallet");
          await bonusRepository.creditWallet(recipientId, 1, usdtAmount);
          // Insert Transaction
          await transactionRepository.insertTransaction(recipientId, "CREDIT","Matching Bonus", 1, usdtAmount, `Matching bonus ${usdtAmount} at Level ${level.level} for ${recipientId} to USDT wallet`);
          // Credit Upline USDT Wallets
          console.log("trigger bonusRepository.creditWallet");
          await bonusRepository.creditWallet(recipientId, 2, apAmount);
          // Insert Transaction
          await transactionRepository.insertTransaction(recipientId, "CREDIT","Matching Bonus", 2, apAmount, `Matching bonus ${apAmount} at Level ${level.level} for ${recipientId} to Activation Point wallet`);
          // Update Matching Bonus Status
          await bonusRepository.updateMatchingBonusStatus(bid, 'completed', false);
          // **Skip RV wallet debit if recipient is top account**
          if (!isTopAccount) {
            console.log("trigger bonusRepository.debitWallet");
            await bonusRepository.debitWallet(recipientId, 6, bonusAmount); // RV wallet
            // Insert Transaction
            await transactionRepository.insertTransaction(
                recipientId, "DEBIT", "Reward Value", 6, bonusAmount, 
                `Reward Value ${bonusAmount} for ${recipientId} Reward Value Wallet`
            );
          }
        }
        currentMemberId = recipientId;
        console.log("--------------------------------------------------------------------------------------------------------------");
      }
}

// Daily process at 12:01 AM
async function processPendingBonuses() {
  const pendingReferralBonuses = await bonusRepository.getPendingReferralBonuses();
  const pendingMatchingBonuses = await bonusRepository.getPendingMatchingBonuses();
  const keyname = 'top_account_no'
  const topLevelAccount = await settingRepository.getSettingValueByKeyName(keyname);

  // Process pending referral bonuses
  for (let bonus of pendingReferralBonuses) {
      const { id, memberId,sponsorId,usdtAmount,apAmount } = bonus;
      // Check RV balance
      const rvBalance = await bonusRepository.getRvBalance(sponsorId);
      if (rvBalance >= amount) {
        // Credit pending bonus Sponsor USDT Wallet
        await bonusRepository.creditWallet(sponsorId, 1, usdtAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(sponsorId, "CREDIT","Referral Bonus", 1, usdtAmount, `Pending Referral Bonus ${usdtAmount} for ${sponsorId} to USDT wallet`);
        // Credit Sponsor Activation Point Wallet
        await bonusRepository.creditWallet(sponsorId, 2, apAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(sponsorId, "CREDIT","Referral Bonus", 2, apAmount, `Pending Referral Bonus ${apAmount} for ${sponsorId} to Activation Point Wallet`);
        // Update Referral Bonus Status
        await bonusRepository.updateReferralBonusStatus(id, 'completed', false);
      } else {
        // Credit pending bonus to Top-Level Account
        await bonusRepository.creditWallet(topLevelAccount, 1, usdtAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(topLevelAccount, "CREDIT","Referral Bonus", 1, usdtAmount, `${sponsorId} having low Reward Value, Referral Bonus ${usdtAmount} to ${topLevelAccount} USDT wallet`);
        // Credit pending bonus to Top-Level Account
        //await bonusRepository.creditWallet(topLevelAccount, 4, apAmount);
        // Insert Transaction
        //await transactionRepository.insertTransaction(topLevelAccount, "CREDIT","Referral Bonus", 4, apAmount, `${sponsorId} having low Reward Value, Referral Bonus ${apAmount} to ${topLevelAccount} Activation Point wallet`);
        // Update Referral Bonus Status
        await bonusRepository.updateReferralBonusStatus(id, 'completed',true);
      }
  }

  // Process pending matching bonuses
  for (let bonus of pendingMatchingBonuses) {
    const { id, memberId,parentId,bonusAmount,usdtAmount,apAmount } = bonus;
    // Check RV balance
    const rvBalance = await bonusRepository.getRvBalance(parentId);
    if (rvBalance >= amount) {
        // Credit pending bonus normally
        await bonusRepository.creditWallet(parentId, 1, usdtAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(parentId, "CREDIT","Matching Bonus", 1, usdtAmount, `Pending Matching Bonus ${usdtAmount} for ${parentId} to USDT wallet`);
        // Credit upline Activation Point Wallet
        await bonusRepository.creditWallet(parentId, 2, apAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(parentId, "CREDIT","Matching Bonus", 2, apAmount, `Pending Matching Bonus ${apAmount} for ${parentId} to Activation Point Wallet`);
        // Update Matching Bonus Status
        await bonusRepository.updateMatchingBonusStatus(id,'completed',false);
    } else {
        // Credit pending bonus to Top-Level Account
        await bonusRepository.creditWallet(topLevelAccount, 1, usdtAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(topLevelAccount, "CREDIT","Matching Bonus", 1, usdtAmount, `${parentId} having low Reward Value, Referral Bonus ${usdtAmount} to ${topLevelAccount} USDT wallet`);
        // Credit pending bonus to Top-Level Account
        await bonusRepository.creditWallet(topLevelAccount, 2, apAmount);
        // Insert Transaction
        await transactionRepository.insertTransaction(topLevelAccount, "CREDIT","Matching Bonus", 2, apAmount, `${parentId} having low Reward Value, Referral Bonus ${apAmount} to ${topLevelAccount} Activation Point wallet`);
        // Update Referral Bonus Status
        await bonusRepository.updateMatchingBonusStatus(id, 'completed',true);
    }
  }
}

// Run every day at 12:01 AM
setInterval(processPendingBonuses, 86400000);

module.exports = { processReferralBonus, processMatchingBonus, processPendingBonuses  };
