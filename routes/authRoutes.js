/**
 * 🔹 authRoutes.js (Registers Authentication Routes)
 * ✅ Uses basicAuth for login.
 * ✅ Uses authMiddleware for protected routes.
 *
 */
const express = require("express");
const router = express.Router();
const authHandler = require("../handlers/authHandler");

router.post("/login", authHandler.login);  // POST /api/auth/login
router.post("/refresh-token", authHandler.refreshToken); // ✅ Refresh token endpoint

module.exports = router;

