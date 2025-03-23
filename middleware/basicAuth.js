/**
 * 🔹 basicAuth.js (Handles Basic Authentication)
 * ✅ Extracts username & password from Authorization: Basic <Base64> header.
 * ✅ Verifies credentials using the database.
 */
const bcrypt = require("bcryptjs");
const pool = require("../config/dbConfig");

module.exports = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return res.status(401).json({ message: "Missing Authorization Header" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [username, password] = credentials.split(":");

    try {
        const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        req.authUser = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
