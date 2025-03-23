/**
 * ✅ Uses basicAuth.js to validate login.
 * ✅ Generates JWT Access & Refresh Tokens on success.
 */
// handlers/authHandler.js
const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({ message: 'Missing Authorization Header' });
        }

        // Decode Base64 Credentials
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        console.log("username: " + username);
        console.log("password: " + password);

        // Authenticate User
        const { user, accessToken, refreshToken } = await authService.authenticateUser(username, password);

        res.json({ accessToken, refreshToken, user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const refreshToken = async (req, res) => {
    console.log("Received Refresh Token:", req.body); // Debugging
    console.log("Request Headers:", req.headers);
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        const newTokens = await authService.refreshAccessToken(refreshToken);
        res.json(newTokens);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

module.exports = { login, refreshToken };


