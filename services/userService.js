const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtHelper');

const registerUser = async (userData) => {
    userData.password_hash = await bcrypt.hash(userData.password, 10);
    delete userData.password; // Remove plain password
    return await userRepository.createUser(userData);
};

module.exports = { registerUser };