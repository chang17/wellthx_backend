const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const redeemHandler = require('../handlers/redeemHandler');

// ✅ Create a redemption transaction
router.post('/create', authMiddleware, redeemHandler.createRedemption);

// ✅ Get redemption transaction by redeemId
router.post('/cancel/:redeemId', authMiddleware, redeemHandler.cancelRedemption);

// ✅ Get all redemption records
router.get('/', authMiddleware, redeemHandler.getRedemptionList);

// ✅ Get all redemption records
router.get('/member', authMiddleware, redeemHandler.getRedemptionByMemberId);

// ✅ Approve Redemption
router.put('/approve/:redemptionId', authMiddleware, redeemHandler.approveRedemption);

// ✅ Confirm Delivery (Add tracking details)
router.put('/confirm/:redemptionId', authMiddleware, redeemHandler.confirmDelivery);

// ✅ Mark as Delivered
router.put('/deliver/:redemptionId', authMiddleware, redeemHandler.markAsDelivered);

module.exports = router;


