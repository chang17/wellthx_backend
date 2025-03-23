const express = require('express');
const router = express.Router();
const referralHandler = require('../handlers/referralHandler');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, referralHandler.getUserReferrals);

module.exports = router;