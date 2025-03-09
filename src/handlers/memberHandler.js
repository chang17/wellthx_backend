const memberService = require('../services/memberService');

exports.getMemberTree = async (req, res) => {
    const { userId } = req.params;

    try {
        const memberTree = await memberService.getMemberTree(userId);
        res.json(memberTree);
    } catch (error) {
        console.error('Error in getMemberTree:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
