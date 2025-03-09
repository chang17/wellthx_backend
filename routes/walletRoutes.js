const express = require('express');
const router = express.Router();
const walletHandler = require('../handlers/walletHandler');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/balance', authMiddleware, walletHandler.getWalletBalance);
module.exports = router;
