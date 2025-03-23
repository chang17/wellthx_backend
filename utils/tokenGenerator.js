// utils/tokenGenerator.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
};

module.exports = generateTokens;
