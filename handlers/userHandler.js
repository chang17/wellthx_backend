const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
   console.log("All users retrieved successfully");
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    console.log("User profile retrieved successfully" );
};

const getDownlineByReferralId = async (req, res) => {
    try {
        const user = await userService.getDownlineByReferralId(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    console.log("User profile retrieved successfully" );
};
const getDownlineByUsername = async (req, res) => {
    try {
        const user = await userService.getDownlineByUsername(req.body);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    console.log("User profile retrieved successfully" );
};

const updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    console.log("User profile update successfully");
};

const registerUser = async (req, res) => {
    console.log("userHandler.registerUser");
    try {
        console.log("Request : " , req.body);
        const response  = await userService.registerUser(req.body);
        res.status(201).json(response);
    } catch (error) {
        console.error("Error registering user:", error.message);
        res.status(500).json({ code: "E500", message: error.message });
    }
};

// ✅ Ensure these functions are correctly exported
module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    registerUser,
    getDownlineByReferralId,
    getDownlineByUsername
};
