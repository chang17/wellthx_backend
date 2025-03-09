const express = require('express');
const router = express.Router();
const memberService = require('../services/memberService');

// Get First-Level Members (Direct Sponsors Only)
router.get('/members/:userId', async (req, res) => {
    try {
        const data = await memberService.getFirstLevelMembers(req.params.userId);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Children of a Member (For Lazy Loading)
router.get('/members/:userId/children', async (req, res) => {
    try {
        const data = await memberService.getChildrenMembers(req.params.userId);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
