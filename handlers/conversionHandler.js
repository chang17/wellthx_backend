const conversionService = require("../services/conversionService");

const convertRebateToAP = async (req, res) => {
    try {
        const { memberId, amount , userId} = req.body;

        if (!memberId || !amount|| !userId) {
            return res.status(400).json({ code: "E400", message: "Missing required parameters." });
        }

        const result = await conversionService.convertRebateToAP(memberId, userId, amount);
        res.status(200).json(result);
    } catch (error) {
        console.error("Conversion Error:", error);
        res.status(500).json({ code: "E500", message: "Internal Server Error." });
    }
};

module.exports = { convertRebateToAP };
