const transferService = require("../services/transferService");

const transferPoints = async (req, res) => {
    try {
        const { senderId, receiverId, walletTypeId, amount } = req.body;

        if (!senderId || !receiverId || !walletTypeId || !amount) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const result = await transferService.transferPoints(senderId, receiverId, walletTypeId, amount);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = { transferPoints };
