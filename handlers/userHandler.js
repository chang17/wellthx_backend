const registerUser = (req, res) => {
    res.json({ message: "User registered successfully" });
};

const loginUser = (req, res) => {
    res.json({ message: "User logged in successfully" });
};

const getUserProfile = (req, res) => {
    res.json({ message: "User profile retrieved successfully" });
};

// ✅ Ensure these functions are correctly exported
module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
