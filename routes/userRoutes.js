const express = require('express');
const router = express.Router();
const userHandler = require('../handlers/userHandler');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userHandler.registerUser);
router.post('/login', userHandler.loginUser);
router.get('/profile', authMiddleware, userHandler.getUserProfile);

module.exports = router;