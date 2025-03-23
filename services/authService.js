const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

// Use environment variables or fallback values for token expiry
const ACCESS_TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET; // Replace with your actual secret key

const authenticateUser = async (username, password) => {
    // Fetch user details from the repository
    let user = await userRepository.getUserByUsername(username);
    if (!user) {
        throw new Error("User not found");
    }

    // Ensure the user record has a hashed password
    if (!user.password) {
        throw new Error("User record is incomplete");
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid Credentials");
    }

    // Generate JWT tokens using secrets from environment variables
    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    };
};

const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log("decoded: " , decoded)
        const user = await userRepository.getUserById(decoded.id);
        if (!user) {   
            throw new Error("User not found");
        }

        // Generate new tokens
        const accessToken = generateAccessToken(user);
        //const newRefreshToken = generateRefreshToken(user);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
    } catch (error) {
        console.error(error);
        throw new Error("Invalid or expired refresh token");
    }
};

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role_id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

const getUsernameFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded.username; // Assuming 'username' is stored in the token payload
    } catch (error) {
        console.error("Invalid token:", error.message);
        return null;
    }
};

module.exports = { authenticateUser, refreshAccessToken, getUsernameFromToken };
