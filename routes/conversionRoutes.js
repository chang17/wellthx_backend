const express = require("express");
const router = express.Router();
const conversionHandler = require("../handlers/conversionHandler");

router.post("/rptoap", conversionHandler.convertRebateToAP);

module.exports = router;
