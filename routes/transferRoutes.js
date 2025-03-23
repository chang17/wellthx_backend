const express = require("express");
const transferHandler = require("../handlers/transferHandler");

const router = express.Router();

router.post("/", transferHandler.transferPoints);

module.exports = router;
