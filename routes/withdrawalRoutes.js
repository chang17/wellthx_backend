const express = require("express");
const withdrawalHandler = require("../handlers/withdrawalHandler");
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/request", authMiddleware, withdrawalHandler.requestWithdrawal);
router.post("/cancel", authMiddleware, withdrawalHandler.cancelWithdrawal);
router.get("/member/:memberId", authMiddleware, withdrawalHandler.getWithdrawalsByMember);
router.get("/history/:memberId", authMiddleware, withdrawalHandler.getWithdrawalHistory);
router.post("/admin/process", authMiddleware, withdrawalHandler.processWithdrawals);

module.exports = router;
