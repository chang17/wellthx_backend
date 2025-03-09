const express = require('express');
const router = express.Router();
const notificationHandler = require('../handlers/notificationHandler');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, notificationHandler.getNotifications);
router.patch('/:id/read', authMiddleware, notificationHandler.markAsRead);
module.exports = router;