/**
 * 🔹 authMiddleware.js (Handles JWT Authentication)
 * ✅ Extracts JWT token from Authorization: Bearer <Token> header.
 * ✅ Verifies token and allows or denies access.
 */
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        console.log("Authorization Header:", req.headers["authorization"]);
        // Extract token from Authorization header
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.error("JWT Verification Error:", error);
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

module.exports = authMiddleware;
