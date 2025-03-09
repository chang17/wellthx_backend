const express = require('express');
const router = express.Router();
const adminHandler = require('../handlers/adminHandler');
const authMiddleware = require('../middleware/authMiddleware'); // Ensures the user is logged in
const roleMiddleware = require('../middleware/roleMiddleware'); // Checks if the user has an admin role

// ✅ Only authenticated users with "admin" role can access these routes
router.get('/users', authMiddleware, roleMiddleware('admin'), adminHandler.getAllUsers);
router.patch('/users/:id/status', authMiddleware, roleMiddleware('admin'), adminHandler.updateUserStatus);
router.get('/transactions', authMiddleware, roleMiddleware('admin'), adminHandler.getAllTransactions);

module.exports = router;
