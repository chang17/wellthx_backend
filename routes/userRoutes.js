/**
 * Admin-level user management (Admin CRUD)
 */
const express = require('express');
const router = express.Router();
const userHandler = require('../handlers/userHandler');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userHandler.getAllUsers);
router.get('/:id', authMiddleware, userHandler.getUserById);
router.get('/downline/referral/:id', authMiddleware, userHandler.getDownlineByReferralId);
router.get('/downline/search', authMiddleware, userHandler.getDownlineByUsername);
router.patch('/:id', authMiddleware, userHandler.updateUser);
router.post('/', userHandler.registerUser);

module.exports = router;