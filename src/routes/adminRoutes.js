const express = require('express');
const router = express.Router();
const adminHandler = require('../handlers/adminHandler');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/users', authMiddleware, roleMiddleware('admin'), adminHandler.getAllUsers);
router.patch('/users/:id/status', authMiddleware, roleMiddleware('admin'), adminHandler.updateUserStatus);
router.get('/transactions', authMiddleware, roleMiddleware('admin'), adminHandler.getAllTransactions);
module.exports = router;